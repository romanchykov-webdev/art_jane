import { ProductStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Инициализируем Stripe версией API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

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
            // 2. ПРИНУДИТЕЛЬНОЕ УБИЙСТВО СЕССИИ В STRIPE
            // Теперь по этой ссылке больше нельзя будет заплатить
            await stripe.checkout.sessions.expire(sessionId);

            // 3. ОСВОБОЖДЕНИЕ ТОВАРОВ В БАЗЕ ДАННЫХ
            const orderId = session.metadata?.orderId;

            if (orderId) {
                await prisma.$transaction(async tx => {
                    const order = await tx.order.findUnique({
                        where: { id: orderId },
                        select: { status: true },
                    });

                    // Идемпотентность: меняем только если заказ всё ещё PENDING
                    if (order && order.status === 'PENDING') {
                        // Отменяем заказ
                        await tx.order.update({
                            where: { id: orderId },
                            data: { status: 'CANCELLED' },
                        });

                        // Мгновенно возвращаем товары в продажу
                        await tx.product.updateMany({
                            where: {
                                orderItems: {
                                    some: { orderId: orderId }, // Ищем через промежуточную таблицу
                                },
                                status: ProductStatus.RESERVED,
                            },
                            data: {
                                status: ProductStatus.AVAILABLE,
                                reservedUntil: null,
                            },
                        });
                    }
                });
            }
        }
    } catch (error) {
        console.error(
            '[CANCEL_API] Ошибка при принудительной отмене заказа:',
            error
        );
        // Мы логируем ошибку, но всё равно перенаправляем юзера на страницу отмены,
        // чтобы не показывать ему страшный белый экран с 500 ошибкой.
    }

    // 4. Финальный редирект на визуальную страницу отмены
    return NextResponse.redirect(cancelPageUrl);
}
