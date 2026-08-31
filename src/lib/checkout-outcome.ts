import { OrderStatus } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { fulfillOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { isSessionPaid, stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export type OrderView = {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    items: {
        id: string;
        titleAtOrder: string;
        priceAtOrder: number;
        product: { slug: string; thumbnailFront: string };
    }[];
};

export type Outcome =
    | { kind: 'paid'; order: OrderView }
    | { kind: 'processing' } // отложенный платёж ещё не подтверждён
    | { kind: 'unconfirmed' }; // не смогли сверить заказ со Stripe

/**
 * Страница успеха не просто говорит «спасибо» — она сама сверяет заказ со Stripe
 * и при необходимости завершает его.
 *
 * Раньше единственным местом, где заказ переходил в PAID, был вебхук: если он
 * не доходил (упавший прод, неверный секрет, локальная разработка без
 * `stripe listen`), покупателю показывали «Спасибо за заказ», а в базе висел
 * PENDING, товар оставался RESERVED и корзина не очищалась. Теперь вебхук —
 * страховка, а не единственная точка отказа: кто первым добежал, тот и провёл
 * заказ, `fulfillOrder` идемпотентен.
 *
 * Порядок шагов здесь принципиален: сначала read-only чтение и проверка
 * владения, и только потом мутация. Раньше `fulfillOrder` вызывался ДО сверки
 * `userId` — по одной ссылке с чужим `session_id` можно было провести чужой
 * заказ, не будучи его владельцем.
 */
export async function resolveOutcome(
    sessionId: string | undefined
): Promise<Outcome> {
    if (!sessionId) return { kind: 'unconfirmed' };

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const orderId = session.metadata?.orderId;

        if (!orderId) return { kind: 'unconfirmed' };

        const requestHeaders = await headers();

        const [order, authSession] = await Promise.all([
            prisma.order.findUnique({
                where: { id: orderId },
                select: {
                    id: true,
                    status: true,
                    userId: true,
                    totalAmount: true,
                    items: {
                        select: {
                            id: true,
                            titleAtOrder: true,
                            priceAtOrder: true,
                            product: {
                                select: { slug: true, thumbnailFront: true },
                            },
                        },
                    },
                },
            }),
            auth.api.getSession({ headers: requestHeaders }),
        ]);

        if (!order) return { kind: 'unconfirmed' };

        // Состав заказа показываем только владельцу: session_id оседает
        // в истории браузера, и по одной ссылке чужой заказ читать нельзя.
        if (!order.userId || order.userId !== authSession?.user?.id) {
            return { kind: 'unconfirmed' };
        }

        // userId был нужен только для проверки выше — во вьюху он не едет.
        const orderView: OrderView = {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            items: order.items,
        };
        const paid = isSessionPaid(session);

        switch (orderView.status) {
            // Заказ уже проведён — вебхуком или предыдущим открытием страницы.
            // Повторный fulfillOrder всё равно вернул бы false, не дёргаем БД.
            case OrderStatus.PAID:
            case OrderStatus.SHIPPED:
                return { kind: 'paid', order: orderView };

            case OrderStatus.PENDING: {
                // Деньги ещё в пути (SEPA, Klarna и прочие отложенные методы).
                // Бронь не трогаем — её судьбу решит async-вебхук.
                if (!paid) return { kind: 'processing' };

                // Проводим заказ прямо здесь, не дожидаясь вебхука.
                if (await fulfillOrder(orderId)) {
                    return {
                        kind: 'paid',
                        order: { ...orderView, status: OrderStatus.PAID },
                    };
                }

                // fulfillOrder отказался — значит между нашим чтением и этим
                // вызовом статус успел поменять кто-то ещё (вебхук или cron).
                // Перечитываем, чтобы не нарисовать ложное «оплата получена».
                const current = await prisma.order.findUnique({
                    where: { id: orderId },
                    select: { status: true },
                });

                if (
                    current?.status === OrderStatus.PAID ||
                    current?.status === OrderStatus.SHIPPED
                ) {
                    return {
                        kind: 'paid',
                        order: { ...orderView, status: current.status },
                    };
                }

                console.error(
                    `[ALARM_ORPHAN_PAYMENT_SUCCESS_PAGE] Оплата по сессии ${sessionId} получена, ` +
                        `но заказ ${orderId} провести не удалось ` +
                        `(статус: ${current?.status ?? 'заказ не найден'}). Требуется ручная проверка.`
                );
                return { kind: 'unconfirmed' };
            }

            // Заказ отменён: гонкой, истёкшей бронью или провалом платежа.
            // Если деньги при этом всё-таки получены — это сирота, которую
            // не починит ни один ретрай Stripe, нужно ручное вмешательство.
            case OrderStatus.CANCELLED:
                if (paid) {
                    console.error(
                        `[ALARM_ORPHAN_PAYMENT_SUCCESS_PAGE] Оплата по сессии ${sessionId} получена, ` +
                            `но заказ ${orderId} уже отменён. Требуется ручная проверка.`
                    );
                }
                return { kind: 'unconfirmed' };

            default:
                return { kind: 'unconfirmed' };
        }
    } catch (error) {
        console.error('[CHECKOUT_SUCCESS] Не удалось сверить заказ:', error);
        return { kind: 'unconfirmed' };
    }
}
