'use server';

import { ProductStatus } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { acquireCheckoutLock, releaseCheckoutLock } from '@/lib/checkout-lock';
import { releaseOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import {
    customerInfoSchema,
    type CustomerInfo,
} from '@/lib/validations/checkout';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import {
    type CheckoutErrorCode,
    type CheckoutResult,
    type UnavailableProduct,
} from '@/types/checkout';

class TransactionError extends Error {
    constructor(
        public code: CheckoutErrorCode,
        message: string,
        public unavailableProducts?: UnavailableProduct[]
    ) {
        super(message);
    }
}

const DB_RESERVATION_MINUTES = 40;
const STRIPE_SESSION_MINUTES = 32;

type TxResult = {
    orderId: string;
    products: {
        id: string;
        status: ProductStatus;
        price: number;
        title: string;
    }[];
};

// Безопасный парсер логов
function getSafeErrorData(error: unknown) {
    if (error instanceof Error) {
        // Безопасное расширение типа
        const e = error as Error & { code?: string | number };
        if (e.name === 'PrismaClientValidationError') {
            return { name: e.name, message: '[CENSORED_PII]', code: e.code };
        }
        return { name: e.name, message: e.message, code: e.code };
    }
    if (typeof error === 'object' && error !== null) {
        // Строгая типизация объекта
        const e = error as Record<string, unknown>;
        return {
            name: typeof e.name === 'string' ? e.name : 'Unknown',
            message: typeof e.message === 'string' ? e.message : 'Unknown',
            code: e.code,
        };
    }
    return { name: 'UnknownError', message: String(error) };
}

export async function createCheckoutSession(
    data: CustomerInfo,
    expectedProductIds: string[],
    expectedTotal: number
): Promise<CheckoutResult> {
    const errorId = crypto.randomUUID();

    try {
        if (!Number.isInteger(expectedTotal)) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Некорректный формат суммы.',
            };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;

        if (!userId) {
            return {
                ok: false,
                code: 'UNAUTHORIZED',
                message: 'Для оформления заказа необходимо авторизоваться',
            };
        }

        const parsed = customerInfoSchema.safeParse(data);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Проверьте корректность данных формы',
            };
        }
        const customer = parsed.data;

        // Захват мьютекса ДО чтения корзины: GC тоже обязан идти под локом,
        // иначе параллельный запрос успеет отменить заказ, который прямо
        // сейчас ждёт ответа от Stripe, — и покупатель заплатит за вещь,
        // уже уехавшую в CANCELLED.
        //
        // Токеном служит errorId: он уже сгенерирован и попадает в логи,
        // так что зависший лок сопоставляется с конкретным запросом.
        const lockAcquired = await acquireCheckoutLock(userId, errorId);

        if (!lockAcquired) {
            return {
                ok: false,
                code: 'PROCESSING_ERROR',
                message:
                    'Ваш заказ формируется. Пожалуйста, подождите пару секунд.',
            };
        }

        try {
            const cartItems = await prisma.cartItem.findMany({
                where: { userId },
                select: { productId: true },
            });
            const serverProductIds = cartItems.map(item => item.productId);

            if (!serverProductIds.length) {
                revalidatePath('/checkout');
                return {
                    ok: false,
                    code: 'EMPTY_CART',
                    message: 'Ваша корзина пуста',
                };
            }

            const expectedSorted = [...expectedProductIds].sort().join(',');
            const serverSorted = [...serverProductIds].sort().join(',');

            if (expectedSorted !== serverSorted) {
                revalidatePath('/checkout');
                return {
                    ok: false,
                    code: 'CART_CHANGED',
                    message:
                        'Состав корзины изменился. Пожалуйста, проверьте корзину.',
                };
            }

            // --- GARBAGE COLLECTOR & IDEMPOTENCY ---
            const gc = await collectPendingOrders({
                userId,
                serverSorted,
                expectedTotal,
                errorId,
            });

            if (gc.blocked) return gc.blocked;
            if (gc.reusedUrl) return { ok: true, url: gc.reusedUrl };

            // --- ФАЗА БД: БРОНИРОВАНИЕ ---
            const reservedUntil = new Date(
                Date.now() + DB_RESERVATION_MINUTES * 60 * 1000
            );
            let transactionResult: TxResult;

            try {
                transactionResult = await prisma.$transaction(
                    async tx => {
                        const lockedProducts = await tx.$queryRaw<
                            {
                                id: string;
                                status: ProductStatus;
                                price: number;
                                title: string;
                            }[]
                        >`
                            SELECT id, status, price, title
                            FROM "Product"
                            WHERE id = ANY(${serverProductIds}::text[])
                            ORDER BY id
                            FOR UPDATE
                        `;

                        if (lockedProducts.length !== serverProductIds.length) {
                            throw new TransactionError(
                                'PRODUCT_UNAVAILABLE',
                                'Один из товаров больше не существует в каталоге'
                            );
                        }

                        const unavailable = lockedProducts.filter(
                            p => p.status !== ProductStatus.AVAILABLE
                        );
                        if (unavailable.length > 0) {
                            throw new TransactionError(
                                'PRODUCT_UNAVAILABLE',
                                `Некоторые товары уже забронированы или проданы`,
                                unavailable.map(p => ({
                                    id: p.id,
                                    reason:
                                        p.status === ProductStatus.SOLD
                                            ? ('SOLD' as const)
                                            : ('RESERVED' as const),
                                }))
                            );
                        }

                        const totalAmount = lockedProducts.reduce(
                            (sum, p) => sum + p.price,
                            0
                        );

                        if (totalAmount !== expectedTotal) {
                            throw new TransactionError(
                                'CART_CHANGED',
                                'Цена товаров изменилась. Пожалуйста, обновите страницу.'
                            );
                        }

                        const order = await tx.order.create({
                            data: {
                                status: 'PENDING',
                                userId: userId,
                                customerEmail: customer.email,
                                customerName: `${customer.firstName} ${customer.lastName}`,
                                customerPhone: customer.phone,
                                shippingCountry: customer.country,
                                shippingCity: customer.city,
                                shippingPostalCode: customer.postalCode,
                                shippingStreet: customer.street,
                                shippingState: customer.state ?? null,
                                totalAmount,
                                expiresAt: reservedUntil,
                                items: {
                                    create: lockedProducts.map(p => ({
                                        productId: p.id,
                                        priceAtOrder: p.price,
                                        titleAtOrder: p.title,
                                    })),
                                },
                            },
                            select: { id: true },
                        });

                        await tx.product.updateMany({
                            where: { id: { in: serverProductIds } },
                            data: {
                                status: ProductStatus.RESERVED,
                                reservedUntil,
                            },
                        });

                        return { orderId: order.id, products: lockedProducts };
                    },
                    { timeout: 10000, maxWait: 5000 }
                );
            } catch (txError) {
                if (txError instanceof TransactionError) {
                    if (
                        txError.code === 'CART_CHANGED' ||
                        txError.code === 'PRODUCT_UNAVAILABLE'
                    ) {
                        revalidatePath('/checkout');
                    }
                    return {
                        ok: false,
                        code: txError.code,
                        message: txError.message,
                        ...(txError.unavailableProducts && {
                            unavailableProducts: txError.unavailableProducts,
                        }),
                    };
                }
                throw txError;
            }

            // --- ФАЗА STRIPE ---
            const stripeExpiresAt = Math.floor(
                (Date.now() + STRIPE_SESSION_MINUTES * 60 * 1000) / 1000
            );
            let checkoutSession: Stripe.Checkout.Session;

            try {
                checkoutSession = await stripe.checkout.sessions.create(
                    {
                        mode: 'payment',
                        payment_method_types: ['card'],
                        customer_email: customer.email,
                        expires_at: stripeExpiresAt,
                        line_items: transactionResult.products.map(p => ({
                            quantity: 1,
                            price_data: {
                                currency: 'eur',
                                unit_amount: p.price,
                                product_data: { name: p.title },
                            },
                        })),
                        metadata: { orderId: transactionResult.orderId },
                        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
                    },
                    {
                        idempotencyKey: `order_${transactionResult.orderId}`,
                        timeout: 20000,
                    }
                );

                if (!checkoutSession.url) {
                    throw new Error('NO_URL_FROM_STRIPE');
                }
            } catch (error: unknown) {
                const safeError = getSafeErrorData(error);
                console.error(
                    `[CHECKOUT_STRIPE_ERROR] [${errorId}]`,
                    safeError
                );

                const isNetworkError =
                    error instanceof Stripe.errors.StripeConnectionError ||
                    error instanceof Stripe.errors.StripeAPIError;

                // При сетевой ошибке заказ мог всё-таки создаться на стороне Stripe,
                // поэтому бронь не снимаем — её разберёт вебхук или cron-воркер.
                if (!isNetworkError) {
                    await releaseOrder(transactionResult.orderId).catch(() =>
                        console.error(`[ALARM_ROLLBACK_FAILED] [${errorId}]`)
                    );
                }

                return {
                    ok: false,
                    code: 'STRIPE_ERROR',
                    message:
                        'Ошибка связи с платежной системой. Попробуйте еще раз.',
                    errorId,
                };
            }

            // --- ДОЗАПИСЬ ID (И ФИКС ПРИЗРАЧНОЙ ССЫЛКИ) ---
            try {
                await prisma.order.update({
                    where: { id: transactionResult.orderId },
                    data: { stripeSessionId: checkoutSession.id },
                });
            } catch (updateError) {
                console.error(
                    `[ALARM_STRIPE_ID_SYNC_FAILED] [${errorId}]`,
                    getSafeErrorData(updateError)
                );
                // БАЗА УПАЛА. МЫ ОБЯЗАНЫ УБИТЬ ССЫЛКУ, ЧТОБЫ КЛИЕНТ НЕ ЗАПЛАТИЛ В НИКУДА.
                await stripe.checkout.sessions
                    .expire(checkoutSession.id)
                    .catch(() => {});
                return {
                    ok: false,
                    code: 'INTERNAL_ERROR',
                    message:
                        'Ошибка синхронизации сессии. Пожалуйста, попробуйте еще раз.',
                    errorId,
                };
            }

            return { ok: true, url: checkoutSession.url };
        } finally {
            // best-effort: если снять не удалось, лок сам протухнет по TTL
            // и следующая попытка пользователя перехватит его.
            await releaseCheckoutLock(userId, errorId).catch(() =>
                console.error(`[ALARM_LOCK_RELEASE_FAILED] [${errorId}]`)
            );
        }
    } catch (globalError) {
        console.error(
            `[CHECKOUT_CRITICAL_ERROR] [${errorId}]`,
            getSafeErrorData(globalError)
        );
        return {
            ok: false,
            code: 'INTERNAL_ERROR',
            message:
                'Внутренняя ошибка сервера. Сообщите ID ошибки в поддержку.',
            errorId,
        };
    }
}

type GcOutcome = {
    /** Ответ, который надо отдать клиенту немедленно, не создавая новый заказ. */
    blocked?: Extract<CheckoutResult, { ok: false }>;
    /** Ссылка на живую сессию Stripe, которую можно переиспользовать. */
    reusedUrl?: string;
};

/**
 * Разбирает незакрытые PENDING-заказы пользователя перед созданием нового.
 *
 * Живую сессию с тем же составом и суммой переиспользуем, протухшие гасим
 * и возвращаем товары в продажу, уже оплаченную — блокируем, чтобы человек
 * не заплатил дважды за вещь, существующую в одном экземпляре.
 *
 * Вызывается строго под мьютексом из `@/lib/checkout-lock`. Пока лок держится,
 * параллельного createCheckoutSession для этого пользователя не существует —
 * поэтому найденный здесь PENDING-заказ без stripeSessionId гарантированно
 * брошен (процесс упал или лок протух), а не «в полёте». Раньше это
 * различал десятисекундный таймаут по createdAt: если Stripe отвечал дольше,
 * параллельный запрос отменял ещё живой заказ.
 */
async function collectPendingOrders({
    userId,
    serverSorted,
    expectedTotal,
    errorId,
}: {
    userId: string;
    serverSorted: string;
    expectedTotal: number;
    errorId: string;
}): Promise<GcOutcome> {
    const pendingOrders = await prisma.order.findMany({
        where: { userId, status: 'PENDING' },
        select: {
            id: true,
            stripeSessionId: true,
            expiresAt: true,
            totalAmount: true,
            items: { select: { productId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    if (pendingOrders.length === 0) return {};

    // Состояния сессий тянем параллельно: последовательные round-trip'ы
    // к Stripe добавляли по секунде к каждому клику «Proceed to Payment».
    const states = await Promise.all(
        pendingOrders.map(async po => {
            if (!po.stripeSessionId) {
                return { po, session: null, retrieveFailed: false };
            }
            try {
                const session = await stripe.checkout.sessions.retrieve(
                    po.stripeSessionId,
                    undefined,
                    { timeout: 15000 }
                );
                return { po, session, retrieveFailed: false };
            } catch {
                console.warn(
                    `[CHECKOUT_RETRY_WARNING] [${errorId}] Failed to retrieve session ${po.id}`
                );
                return { po, session: null, retrieveFailed: true };
            }
        })
    );

    const now = new Date();

    // Сначала — стоп-проверки по всем заказам сразу. Раньше они срабатывали
    // по ходу цикла, и заказ, встреченный до уже оплаченного, успевал получить
    // ненужный expire перед тем, как выполнение прерывалось.
    for (const { session } of states) {
        if (session?.status === 'complete') {
            return {
                blocked: {
                    ok: false,
                    code: 'PROCESSING_ERROR',
                    message:
                        'Ваш заказ уже оплачен и обрабатывается. Корзина скоро обновится.',
                },
            };
        }
    }

    let reusedUrl: string | null = null;

    for (const { po, session, retrieveFailed } of states) {
        if (!po.expiresAt) continue;

        const itemsSorted = po.items
            .map(i => i.productId)
            .sort()
            .join(',');
        const isMatch =
            itemsSorted === serverSorted && po.totalAmount === expectedTotal;
        const isFresh = po.expiresAt.getTime() > now.getTime() + 5 * 60 * 1000;

        // Нет связи со Stripe — базу не трогаем, иначе можно освободить товар,
        // за который человек прямо сейчас платит.
        let canCancelDb = !retrieveFailed;

        if (session?.status === 'open') {
            // session.url имеет тип string | null. Без проверки на null код
            // уходил в continue, не отменив заказ: товары оставались
            // забронированными собственным заказом пользователя, а следующая
            // попытка падала с PRODUCT_UNAVAILABLE до истечения сессии.
            if (isMatch && isFresh && session.url && !reusedUrl) {
                reusedUrl = session.url;
                continue; // Переиспользуем, отменять не нужно
            }

            try {
                await stripe.checkout.sessions.expire(po.stripeSessionId!);
            } catch (expireErr) {
                console.warn(
                    `[ALARM_EXPIRE_FAILED] [${errorId}]`,
                    getSafeErrorData(expireErr)
                );
                canCancelDb = false; // Stripe упал, оставляем базу в покое
            }
        }
        // Если status === 'expired', canCancelDb остаётся true
        // (Stripe уже протух, чистим базу безопасно)

        if (canCancelDb) {
            await releaseOrder(po.id);
        }
    }

    return reusedUrl ? { reusedUrl } : {};
}
