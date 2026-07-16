'use server';

import { ProductStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

// auth
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
//
import {
    customerInfoSchema,
    type CustomerInfo,
} from '@/lib/validations/checkout';
//
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

const RESERVATION_MINUTES = 30;

export async function createCheckoutSession(
    data: CustomerInfo,
    productIds: string[]
) {
    // 0. СТРОГИЙ КОНТРОЛЬ ДОСТУПА ПОЛЬЗОВАТЕЛЯ если пользователь авторизоват ок если нет return
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Для оформления заказа необходимо авторизоваться');
    }
    // 1. Валидация входных данных
    const customer = customerInfoSchema.parse(data);

    if (!productIds.length) {
        throw new Error('Корзина пуста');
    }

    const reservedUntil = new Date(
        Date.now() + RESERVATION_MINUTES * 60 * 1000
    );

    // 2. АТОМАРНАЯ ТРАНЗАКЦИЯ (Бронирование + Создание Заказа)
    const result = await prisma.$transaction(
        async tx => {
            // Пессимистичная блокировка строк товаров (SELECT FOR UPDATE)

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
            WHERE id = ANY(${productIds}::text[])
            FOR UPDATE
        `;
            console.log('productIds:', productIds);
            console.log('lockedProducts:', lockedProducts);

            // Проверка: все ли товары найдены?
            if (lockedProducts.length !== productIds.length) {
                throw new Error('Один из товаров больше не существует');
            }

            // Проверка: все ли товары доступны?
            const unavailable = lockedProducts.filter(
                p => p.status !== ProductStatus.AVAILABLE
            );
            if (unavailable.length > 0) {
                throw new Error(
                    `Товар "${unavailable[0].title}" уже забронирован или продан`
                );
            }

            // Создаем PENDING заказ
            const totalAmount = lockedProducts.reduce(
                (sum, p) => sum + p.price,
                0
            );

            const order = await tx.order.create({
                data: {
                    status: 'PENDING',
                    // user data
                    userId: userId, // Привязываем заказ к конкретному юзеру
                    customerEmail: customer.email,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    customerPhone: customer.phone,
                    // Сохраняем адрес доставки
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

            // Ставим статус RESERVED
            await tx.product.updateMany({
                where: { id: { in: productIds } },
                data: { status: ProductStatus.RESERVED, reservedUntil },
            });

            return { orderId: order.id, products: lockedProducts };
        },
        { timeout: 10000 }
    );

    // 3. STRIPE INTEGRATION (Вне транзакции!)
    try {
        const session = await stripe.checkout.sessions.create(
            {
                mode: 'payment',
                customer_email: customer.email,

                // Переводим миллисекунды JS в секунды Unix, как требует Stripe
                // expires_at жестко говорит Stripe: "Эта ссылка должна сгореть ровно в ту же секунду, когда истечет бронь в нашей базе (reservedUntil)"
                expires_at: Math.floor(reservedUntil.getTime() / 1000),

                line_items: result.products.map(p => ({
                    quantity: 1,
                    price_data: {
                        currency: 'eur',
                        // 3. Строгая конвертация евро в центы с защитой от округления float
                        unit_amount: p.price,
                        product_data: { name: p.title },
                    },
                })),
                metadata: {
                    orderId: result.orderId, // Передаем ID для последующей обработки в Вебхуке
                },
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
            },
            {
                idempotencyKey: `order_${result.orderId}`, // Сохраняем защиту от дублирования запросов
            }
        );

        // Дозаписываем сессию в заказ (остается без изменений)
        await prisma.order.update({
            where: { id: result.orderId },
            data: { stripeSessionId: session.id },
        });

        return session.url;
    } catch (error) {
        console.error('Ошибка при создании сессии оплаты:', error);

        // КЛИЕНТСКАЯ КОМПЕНСАЦИЯ: Полный безопасный откат при падении Stripe API
        await prisma.$transaction([
            prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { status: ProductStatus.AVAILABLE, reservedUntil: null },
            }),
            // UPDATE при отмене меняем статус на CANCELLED
            prisma.order.update({
                where: { id: result.orderId },
                data: { status: 'CANCELLED' },
            }),
        ]);

        throw new Error('Ошибка при создании сессии оплаты');
    }
}
