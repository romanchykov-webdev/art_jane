import { ProductStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * ЕДИНСТВЕННОЕ место, где заказ меняет статус после ухода покупателя на Stripe.
 *
 * Раньше эта логика была скопирована в вебхук и в cancel-роут, а завершение
 * заказа существовало только внутри вебхука — то есть недоставленный вебхук
 * навсегда оставлял товар в RESERVED. Теперь обе операции вызываются из
 * нескольких точек (вебхук, страница успеха, cron), поэтому обе обязаны быть
 * идемпотентными: состояние меняется, только если заказ всё ещё PENDING,
 * а товары трогаются, только если они всё ещё RESERVED.
 */

/** Сколько заказов/товаров разбирает один прогон воркера. */
const SWEEP_BATCH_SIZE = 200;

/**
 * Успешная оплата: заказ → PAID, товары → SOLD, корзина покупателя очищается.
 *
 * @returns `true`, если заказ был переведён именно этим вызовом;
 *          `false`, если его уже обработали раньше (повторная доставка вебхука,
 *          гонка страницы успеха с вебхуком) или заказа не существует.
 */
export async function fulfillOrder(orderId: string): Promise<boolean> {
    return prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                userId: true,
                items: { select: { productId: true } },
            },
        });

        // Идемпотентность: обрабатываем только PENDING
        if (!order || order.status !== 'PENDING') return false;

        await tx.order.update({
            where: { id: orderId },
            data: { status: 'PAID' },
        });

        // Снимаем бронь и фиксируем продажу.
        // Фильтр по RESERVED — защита от гонки: чужую бронь не перетираем.
        await tx.product.updateMany({
            where: {
                orderItems: { some: { orderId } },
                status: ProductStatus.RESERVED,
            },
            data: { status: ProductStatus.SOLD, reservedUntil: null },
        });

        // Убираем оплаченные позиции из корзины в БД.
        // Клиентский Zustand-стор чистится отдельно на странице успеха.
        if (order.userId) {
            await tx.cartItem.deleteMany({
                where: {
                    userId: order.userId,
                    productId: { in: order.items.map(item => item.productId) },
                },
            });
        }

        return true;
    });
}

/**
 * Заказ не состоялся (отмена, истёкшая сессия, провал отложенного платежа):
 * заказ → CANCELLED, товары возвращаются в продажу.
 *
 * @returns `true`, если заказ отменён именно этим вызовом.
 */
export async function releaseOrder(orderId: string): Promise<boolean> {
    return prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            select: { id: true, status: true, expiresAt: true },
        });

        if (!order || order.status !== 'PENDING') return false;

        await tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        // Сверка reservedUntil с expiresAt заказа отвечает на вопрос
        // «эта бронь всё ещё наша?». Транзакция бронирования выставляет обоим
        // полям одно значение, поэтому расхождение означает, что товар успел
        // перебронировать кто-то другой — такую бронь снимать нельзя, иначе
        // вещь в единственном экземпляре уйдёт двум покупателям сразу.
        await tx.product.updateMany({
            where: {
                orderItems: { some: { orderId } },
                status: ProductStatus.RESERVED,
                ...(order.expiresAt && { reservedUntil: order.expiresAt }),
            },
            data: { status: ProductStatus.AVAILABLE, reservedUntil: null },
        });

        return true;
    });
}

export type SweepResult = {
    releasedOrders: number;
    releasedProducts: number;
};

/**
 * Воркер автоматического снятия протухшей брони.
 *
 * Ровно тот запрос, под который в схеме заведён индекс
 * `@@index([status, reservedUntil])` на Product. До появления этой функции поле
 * `reservedUntil` только записывалось и не читалось нигде, а единственным
 * источником освобождения товара был Stripe — поэтому недоставленный вебхук
 * (или локальная разработка без `stripe listen`) навсегда подвешивал вещь
 * в RESERVED.
 *
 * Работает в два прохода:
 *   1. Протухшие PENDING-заказы отменяются целиком вместе со своими товарами.
 *   2. Подчищаются товары-сироты: бронь истекла, но живого заказа за ней уже нет
 *      (например, заказ отменили, а обновление товара не прошло).
 */
export async function releaseExpiredReservations(): Promise<SweepResult> {
    const now = new Date();

    const staleOrders = await prisma.order.findMany({
        where: { status: 'PENDING', expiresAt: { lt: now } },
        select: { id: true },
        orderBy: { expiresAt: 'asc' },
        take: SWEEP_BATCH_SIZE,
    });

    let releasedOrders = 0;
    for (const order of staleOrders) {
        if (await releaseOrder(order.id)) releasedOrders += 1;
    }

    // Второй проход безопасен: заказы с ещё живой бронью сюда не попадают,
    // потому что Order.expiresAt и Product.reservedUntil выставляются
    // одним и тем же значением в транзакции бронирования.
    const orphans = await prisma.product.updateMany({
        where: {
            status: ProductStatus.RESERVED,
            reservedUntil: { lt: now },
        },
        data: { status: ProductStatus.AVAILABLE, reservedUntil: null },
    });

    return { releasedOrders, releasedProducts: orphans.count };
}
