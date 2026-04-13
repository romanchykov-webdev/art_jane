'use server';

import { auth } from '@/lib/auth';
import { getOrCreateGuestId } from '@/lib/guest';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// 1. УТИЛИТА: Определяем, кто делает запрос (Юзер или Гость)
async function getIdentity() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user) {
        return { userId: session.user.id, guestId: null };
    }

    const guestId = await getOrCreateGuestId();
    return { userId: null, guestId };
}

// 2. ЭКШЕН: Избранное (Toggle)
export async function toggleFavoriteAction(productId: string) {
    try {
        const { userId, guestId } = await getIdentity();

        // Формируем строгий запрос по уникальным составным ключам
        const whereClause = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.favorite.findUnique({
            where: whereClause,
        });

        if (existing) {
            await prisma.favorite.delete({ where: { id: existing.id } });
            return { success: true, action: 'removed' };
        } else {
            await prisma.favorite.create({
                data: {
                    productId,
                    userId,
                    guestId,
                },
            });
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error('[TOGGLE_FAVORITE_ERROR]', error);
        return { success: false, error: 'Failed to toggle favorite' };
    }
}

// 3. ЭКШЕН: Корзина (Toggle)
export async function toggleCartAction(productId: string) {
    try {
        const { userId, guestId } = await getIdentity();

        const whereClause = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.cartItem.findUnique({
            where: whereClause,
        });

        if (existing) {
            await prisma.cartItem.delete({ where: { id: existing.id } });
            return { success: true, action: 'removed' };
        } else {
            await prisma.cartItem.create({
                data: {
                    productId,
                    userId,
                    guestId,
                },
            });
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error('[TOGGLE_CART_ERROR]', error);
        return { success: false, error: 'Failed to toggle cart item' };
    }
}
