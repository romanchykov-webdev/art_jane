import { auth } from '@/lib/auth';
import { releaseOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    // Базовый URL для финального редиректа на UI
    const cancelPageUrl = new URL('/checkout/cancel', req.url);

    if (!sessionId) {
        return NextResponse.redirect(cancelPageUrl);
    }

    try {
        // 1. Проверяем статус сессии в Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Если статус 'open', значит клиент нажал "Назад", и сессия еще жива.
        // Если статус другой (например, 'expired' или 'complete'), делать ничего не нужно.
        if (session.status === 'open') {
            const orderId = session.metadata?.orderId;

            if (orderId && (await isOrderOwner(orderId))) {
                // 2. ПРИНУДИТЕЛЬНОЕ УБИЙСТВО СЕССИИ В STRIPE
                // Теперь по этой ссылке больше нельзя будет заплатить
                await stripe.checkout.sessions.expire(sessionId);

                // 3. ОСВОБОЖДЕНИЕ ТОВАРОВ В БАЗЕ ДАННЫХ (идемпотентно)
                await releaseOrder(orderId);
            }
        }
    } catch (error) {
        console.error(
            '[CANCEL_API] Ошибка при принудительной отмене заказа:',
            error
        );
        // Мы логируем ошибку, но всё равно перенаправляем юзера на страницу отмены,
        // чтобы не показывать ему страшный белый экран с 500 ошибкой.
        // Страховка на случай провала: вебхук `checkout.session.expired`
        // и cron-воркер `/api/cron/release-reservations`.
    }

    // 4. Финальный редирект на визуальную страницу отмены
    return NextResponse.redirect(cancelPageUrl);
}

/**
 * Роут открывается по ссылке из Stripe, то есть его URL с `session_id` оседает
 * в истории браузера и в referrer. Поэтому отменяем заказ только тому, кто его
 * создал — иначе чужой человек со ссылкой мог бы гасить чужие заказы.
 *
 * Если сессии нет или заказ чужой, бронь снимут штатные механизмы:
 * вебхук `checkout.session.expired` (через 32 минуты) либо cron-воркер.
 */
async function isOrderOwner(orderId: string): Promise<boolean> {
    const authSession = await auth.api.getSession({ headers: await headers() });
    const userId = authSession?.user?.id;

    if (!userId) return false;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
    });

    return order?.userId === userId;
}
