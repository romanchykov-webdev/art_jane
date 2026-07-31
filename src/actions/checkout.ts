'use server';

import { ProductStatus } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    customerInfoSchema,
    type CustomerInfo,
} from '@/lib/validations/checkout';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

export type CheckoutErrorCode =
    | 'UNAUTHORIZED'
    | 'VALIDATION_ERROR'
    | 'CART_CHANGED'
    | 'EMPTY_CART'
    | 'PRODUCT_UNAVAILABLE'
    | 'STRIPE_ERROR'
    | 'PROCESSING_ERROR'
    | 'INTERNAL_ERROR';

export type CheckoutResult =
    | { ok: true; url: string }
    | {
          ok: false;
          code: CheckoutErrorCode;
          message: string;
          unavailableProductIds?: string[];
          errorId?: string;
      };

class TransactionError extends Error {
    constructor(
        public code: CheckoutErrorCode,
        message: string,
        public unavailableProductIds?: string[]
    ) {
        super(message);
    }
}

const DB_RESERVATION_MINUTES = 40;
const STRIPE_SESSION_MINUTES = 32;
const IN_FLIGHT_WINDOW_MS = 10000;

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
        const pendingOrders = await prisma.order.findMany({
            where: { userId, status: 'PENDING' },
            select: {
                id: true,
                stripeSessionId: true,
                expiresAt: true,
                totalAmount: true,
                createdAt: true,
                items: { select: { productId: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        let reusedUrl: string | null = null;
        const now = new Date();

        for (const po of pendingOrders) {
            if (!po.expiresAt) continue;

            const ageMs = now.getTime() - po.createdAt.getTime();
            const itemsSorted = po.items
                .map(i => i.productId)
                .sort()
                .join(',');
            const isMatch =
                itemsSorted === serverSorted &&
                po.totalAmount === expectedTotal;
            const isFresh =
                po.expiresAt.getTime() > now.getTime() + 5 * 60 * 1000;

            let canCancelDb = true;

            if (po.stripeSessionId) {
                try {
                    const s = await stripe.checkout.sessions.retrieve(
                        po.stripeSessionId
                    );

                    // 1. Оплаченный заказ - блокируем создание нового!
                    if (s.status === 'complete') {
                        return {
                            ok: false,
                            code: 'PROCESSING_ERROR',
                            message:
                                'Ваш заказ уже оплачен и обрабатывается. Корзина скоро обновится.',
                        };
                    }

                    // 2. Живой заказ
                    if (s.status === 'open') {
                        if (isMatch && isFresh && !reusedUrl) {
                            reusedUrl = s.url;
                            continue; // Переиспользуем, отменять не нужно
                        }

                        try {
                            await stripe.checkout.sessions.expire(
                                po.stripeSessionId
                            );
                        } catch (expireErr) {
                            console.warn(
                                `[ALARM_EXPIRE_FAILED] [${errorId}]`,
                                getSafeErrorData(expireErr)
                            );
                            canCancelDb = false; // Stripe упал, оставляем базу в покое
                        }
                    }
                    // Если status === 'expired', canCancelDb остается true (Stripe уже протух, чистим базу безопасно)
                } catch {
                    console.warn(
                        `[CHECKOUT_RETRY_WARNING] [${errorId}] Failed to retrieve session ${po.id}`
                    );
                    canCancelDb = false; // Нет сети - не трогаем базу
                }
            } else if (ageMs < IN_FLIGHT_WINDOW_MS) {
                // Заказ в полете (без ID), меньше 10 сек - защищаем от отмены и блокируем клик
                return {
                    ok: false,
                    code: 'PROCESSING_ERROR',
                    message:
                        'Ваш заказ формируется. Пожалуйста, подождите пару секунд.',
                };
            }

            if (canCancelDb) {
                await prisma.$transaction([
                    prisma.order.update({
                        where: { id: po.id },
                        data: { status: 'CANCELLED' },
                    }),
                    prisma.product.updateMany({
                        where: {
                            orderItems: { some: { orderId: po.id } },
                            status: ProductStatus.RESERVED,
                            reservedUntil: po.expiresAt,
                        },
                        data: {
                            status: ProductStatus.AVAILABLE,
                            reservedUntil: null,
                        },
                    }),
                ]);
            }
        }

        if (reusedUrl) return { ok: true, url: reusedUrl };

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
                            unavailable.map(p => p.id)
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
                        data: { status: ProductStatus.RESERVED, reservedUntil },
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
                    ...(txError.unavailableProductIds && {
                        unavailableProductIds: txError.unavailableProductIds,
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
                }
            );

            if (!checkoutSession.url) {
                throw new Error('NO_URL_FROM_STRIPE');
            }
        } catch (error: unknown) {
            const safeError = getSafeErrorData(error);
            console.error(`[CHECKOUT_STRIPE_ERROR] [${errorId}]`, safeError);

            const isNetworkError =
                error instanceof Stripe.errors.StripeConnectionError ||
                error instanceof Stripe.errors.StripeAPIError;

            if (!isNetworkError) {
                await prisma
                    .$transaction([
                        prisma.order.update({
                            where: { id: transactionResult.orderId },
                            data: { status: 'CANCELLED' },
                        }),
                        prisma.product.updateMany({
                            where: {
                                orderItems: {
                                    some: {
                                        orderId: transactionResult.orderId,
                                    },
                                },
                                status: ProductStatus.RESERVED,
                                reservedUntil,
                            },
                            data: {
                                status: ProductStatus.AVAILABLE,
                                reservedUntil: null,
                            },
                        }),
                    ])
                    .catch(() =>
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
