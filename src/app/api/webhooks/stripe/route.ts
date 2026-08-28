import { fulfillOrder, releaseOrder } from '@/lib/orders';
import { isSessionPaid, stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Webhook должен работать в Node-рантайме: нужен доступ к crypto и сырому телу
export const runtime = 'nodejs';
// Отключаем кэширование — вебхук всегда динамический
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    // 1. КРИТИЧНО: читаем СЫРОЕ тело (text), а не json.
    //    Любое изменение байтов сломает проверку подписи.
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    // 2. Верифицируем подпись Stripe
    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret
        );
    } catch (err) {
        console.error('[STRIPE_WEBHOOK] Ошибка верификации подписи:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // 3. Обрабатываем нужные события
    try {
        switch (event.type) {
            // Сессия завершена. Для карт деньги уже получены, для методов
            // с отложенным подтверждением — ещё нет, ждём async-события ниже.
            case 'checkout.session.completed': {
                const session = event.data.object;

                if (!isSessionPaid(session)) {
                    console.info(
                        `[STRIPE_WEBHOOK] Сессия ${session.id} завершена без оплаты ` +
                            `(payment_status=${session.payment_status}). Бронь сохранена, ждём async-события.`
                    );
                    break;
                }

                await handleWithOrderId(session, fulfillOrder);
                break;
            }

            // Отложенный платёж дошёл — фиксируем продажу
            case 'checkout.session.async_payment_succeeded': {
                await handleWithOrderId(event.data.object, fulfillOrder);
                break;
            }

            // Отложенный платёж не прошёл — возвращаем товар в продажу
            case 'checkout.session.async_payment_failed': {
                await handleWithOrderId(event.data.object, releaseOrder);
                break;
            }

            // Сессия протухла (пользователь не оплатил за отведённое время)
            case 'checkout.session.expired': {
                await handleWithOrderId(event.data.object, releaseOrder);
                break;
            }

            default:
                // Остальные события просто подтверждаем, чтобы Stripe не ретраил
                break;
        }
    } catch (err) {
        // Возвращаем 500 → Stripe повторит доставку позже (at-least-once)
        console.error(`[STRIPE_WEBHOOK] Ошибка обработки ${event.type}:`, err);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }

    // 4. Подтверждаем получение
    return NextResponse.json({ received: true });
}

/**
 * Достаёт orderId из metadata сессии и передаёт его в идемпотентный обработчик
 * из `@/lib/orders`. Отсутствие orderId — не повод возвращать 500: ретраи
 * Stripe ничего не починят, такое событие нужно просто залогировать.
 */
async function handleWithOrderId(
    session: Stripe.Checkout.Session,
    handler: (orderId: string) => Promise<boolean>
) {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
        console.error(
            `[STRIPE_WEBHOOK] В metadata сессии ${session.id} нет orderId`
        );
        return;
    }

    const result = await handler(orderId);

    if (!result && handler === fulfillOrder) {
        console.error(
            `[ALARM_ORPHAN_PAYMENT] Платёж получен, но заказ ${orderId} не находится в статусе PENDING. ` +
                `Возможно, он уже завершён, отменён или удалён. Требуется проверка.`
        );
    }
}
