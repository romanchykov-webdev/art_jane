'use server';

import { auth } from '@/lib/auth';
import { clearGuestId, getGuestId } from '@/lib/guest';
import { mapToStoreProduct } from '@/lib/mappers';
import { prisma } from '@/lib/prisma';
import { StoreProduct } from '@/types/product';
import { headers } from 'next/headers';

export type SyncResult =
    | {
          success: true;
          data: { cart: StoreProduct[]; favorites: StoreProduct[] } | null;
      }
    | { success: false; error: string };

export async function syncGuestDataToUser(): Promise<SyncResult> {
    // 1. Проверяем, есть ли вообще гостевая кука
    const guestId = await getGuestId();
    if (!guestId) {
        // Сигнал фронтенду: "Гостя не было, Zustand не перезаписывай"
        return { success: true, data: null };
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
        // 3. Запускаем строгую транзакцию БД с Bulk-оптимизацией
        await prisma.$transaction(async tx => {
            // --- СЛИЯНИЕ КОРЗИНЫ ---
            const [guestCartItems, userCartItems] = await Promise.all([
                tx.cartItem.findMany({
                    where: { guestId },
                    select: { id: true, productId: true },
                }),
                tx.cartItem.findMany({
                    where: { userId },
                    select: { productId: true },
                }),
            ]);

            // Set для мгновенного поиска
            const userCartProductIds = new Set(
                userCartItems.map(item => item.productId)
            );
            const cartIdsToDelete: string[] = [];
            const cartIdsToUpdate: string[] = [];

            for (const item of guestCartItems) {
                if (userCartProductIds.has(item.productId)) {
                    cartIdsToDelete.push(item.id); // Дубль -> на удаление
                } else {
                    cartIdsToUpdate.push(item.id); // Уникальный -> на перенос
                    // Добавляем в Set, чтобы защититься от дубликатов внутри самой гостевой корзины
                    userCartProductIds.add(item.productId);
                }
            }

            if (cartIdsToDelete.length > 0) {
                await tx.cartItem.deleteMany({
                    where: { id: { in: cartIdsToDelete } },
                });
            }
            if (cartIdsToUpdate.length > 0) {
                await tx.cartItem.updateMany({
                    where: { id: { in: cartIdsToUpdate } },
                    data: { userId, guestId: null },
                });
            }

            // --- СЛИЯНИЕ ИЗБРАННОГО ---
            const [guestFavorites, userFavorites] = await Promise.all([
                tx.favorite.findMany({
                    where: { guestId },
                    select: { id: true, productId: true },
                }),
                tx.favorite.findMany({
                    where: { userId },
                    select: { productId: true },
                }),
            ]);

            const userFavoriteProductIds = new Set(
                userFavorites.map(item => item.productId)
            );
            const favIdsToDelete: string[] = [];
            const favIdsToUpdate: string[] = [];

            for (const item of guestFavorites) {
                if (userFavoriteProductIds.has(item.productId)) {
                    favIdsToDelete.push(item.id);
                } else {
                    favIdsToUpdate.push(item.id);
                    userFavoriteProductIds.add(item.productId);
                }
            }

            if (favIdsToDelete.length > 0) {
                await tx.favorite.deleteMany({
                    where: { id: { in: favIdsToDelete } },
                });
            }
            if (favIdsToUpdate.length > 0) {
                await tx.favorite.updateMany({
                    where: { id: { in: favIdsToUpdate } },
                    data: { userId, guestId: null },
                });
            }
        });

        // 4. Очищаем гостевую куку (миграция больше не повторится)
        await clearGuestId();

        // 5. КОНТРОЛЬНОЕ ЧТЕНИЕ: Берем финальный стейт ПОСЛЕ коммита
        const [finalCartData, finalFavoritesData] = await Promise.all([
            prisma.cartItem.findMany({
                where: { userId },
                include: { product: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.favorite.findMany({
                where: { userId },
                include: { product: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            success: true,
            data: {
                cart: finalCartData.map(mapToStoreProduct),
                favorites: finalFavoritesData.map(mapToStoreProduct),
            },
        };
    } catch (error) {
        console.error('[SYNC_GUEST_DATA_ERROR]', error);
        return { success: false, error: 'Failed to synchronize data' };
    }
}
