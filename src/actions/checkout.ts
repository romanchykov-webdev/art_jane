'use server';

import { ProductStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
    customerInfoSchema,
    type CustomerInfo,
} from '@/lib/validations/checkout';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
});

const RESERVATION_MINUTES = 15;

export async function createCheckoutSession(
    data: CustomerInfo,
    productIds: string[]
) {
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
                    customerEmail: customer.email,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    customerPhone: customer.phone,
                    totalAmount,
                    expiresAt: reservedUntil,
                    items: { connect: productIds.map(id => ({ id })) },
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

                // 1. Делегируем сбор адреса доставки интерфейсу Stripe
                shipping_address_collection: {
                    allowed_countries: ['IT'], // Укажи коды стран в формате ISO 3166-1 alpha-2
                },

                // 2. Включаем сбор номера телефона на стороне Stripe
                phone_number_collection: {
                    enabled: true,
                },

                line_items: result.products.map(p => ({
                    quantity: 1,
                    price_data: {
                        currency: 'eur',
                        // 3. Строгая конвертация евро в центы с защитой от округления float
                        unit_amount: Math.round(p.price * 100),
                        product_data: { name: p.title },
                    },
                })),
                metadata: {
                    orderId: result.orderId, // Передаем ID для последующей обработки в Вебхуке
                },
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
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
            prisma.order.delete({ where: { id: result.orderId } }),
        ]);

        throw new Error('Ошибка при создании сессии оплаты');
    }
}
