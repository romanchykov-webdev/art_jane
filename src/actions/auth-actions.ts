'use server';

import { auth } from '@/lib/auth';
import { clearGuestId, getGuestId } from '@/lib/guest';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function syncGuestDataToUser() {
    // 1. Проверяем, есть ли вообще гостевая кука
    const guestId = await getGuestId();
    if (!guestId) {
        return { success: true, message: 'No guest data to sync' };
    }

    // 2. Проверяем, авторизован ли пользователь (Better-Auth)
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    try {
        // 3. Запускаем строгую транзакцию БД
        await prisma.$transaction(async tx => {
            // --- СЛИЯНИЕ КОРЗИНЫ ---
            const guestCartItems = await tx.cartItem.findMany({
                where: { guestId },
            });

            for (const item of guestCartItems) {
                const existingUserItem = await tx.cartItem.findUnique({
                    where: {
                        productId_userId: {
                            productId: item.productId,
                            userId,
                        },
                    },
                });

                if (existingUserItem) {
                    // У пользователя уже есть этот товар, удаляем гостевой дубль
                    await tx.cartItem.delete({ where: { id: item.id } });
                } else {
                    // Переносим гостевой товар пользователю
                    await tx.cartItem.update({
                        where: { id: item.id },
                        data: { userId, guestId: null },
                    });
                }
            }

            // --- СЛИЯНИЕ ИЗБРАННОГО ---
            const guestFavorites = await tx.favorite.findMany({
                where: { guestId },
            });

            for (const item of guestFavorites) {
                const existingUserFavorite = await tx.favorite.findUnique({
                    where: {
                        productId_userId: {
                            productId: item.productId,
                            userId,
                        },
                    },
                });

                if (existingUserFavorite) {
                    await tx.favorite.delete({ where: { id: item.id } });
                } else {
                    await tx.favorite.update({
                        where: { id: item.id },
                        data: { userId, guestId: null },
                    });
                }
            }
        });

        // 4. Очищаем гостевую куку, чтобы больше не триггерить эту логику
        await clearGuestId();

        return { success: true };
    } catch (error) {
        console.error('[SYNC_GUEST_DATA_ERROR]', error);
        return { success: false, error: 'Failed to synchronize data' };
    }
}
