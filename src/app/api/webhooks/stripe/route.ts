import { ProductStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Webhook должен работать в Node-рантайме: нужен доступ к crypto и сырому телу
export const runtime = 'nodejs';
// Отключаем кэширование — вебхук всегда динамический
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

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
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            // Сессия протухла (пользователь не оплатил за отведённое время)
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutExpired(session);
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

// ✅ Успешная оплата: заказ → PAID, товары → SOLD
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.error('[STRIPE_WEBHOOK] В metadata нет orderId');
        return;
    }

    await prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            select: { id: true, status: true },
        });

        // 🔥 Идемпотентность: Обрабатываем только PENDING
        if (!order || order.status !== 'PENDING') return;

        // Обновляем ТОЛЬКО статус.
        await tx.order.update({
            where: { id: orderId },
            data: { status: 'PAID' },
        });

        // Снимаем бронь и фиксируем продажу
        await tx.product.updateMany({
            where: { orderId },
            data: { status: ProductStatus.SOLD, reservedUntil: null },
        });
    });
}

// ⏱️ Сессия истекла: освобождаем товары, отменяем заказ
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    await prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            select: { id: true, status: true },
        });

        if (!order || order.status !== 'PENDING') return;

        await tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        // Возвращаем товары в продажу, только если они всё ещё зарезервированы
        await tx.product.updateMany({
            where: { orderId, status: ProductStatus.RESERVED },
            data: { status: ProductStatus.AVAILABLE, reservedUntil: null },
        });
    });
}
