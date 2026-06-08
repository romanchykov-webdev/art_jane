'use server';

import { auth } from '@/lib/auth';
import { getOrCreateGuestId } from '@/lib/guest';
import { mapToStoreProduct } from '@/lib/mappers';
import { prisma } from '@/lib/prisma';
import { StoreProduct } from '@/types/product';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

interface NextDynamicError extends Error {
    digest?: string;
}

function isNextDynamicError(error: unknown): error is NextDynamicError {
    return error instanceof Error && 'digest' in error;
}

async function getIdentity() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) return { userId: session.user.id, guestId: null };
    const guestId = await getOrCreateGuestId();
    return { userId: null, guestId };
}

export async function toggleFavoriteAction(
    productId: string,
    intent?: 'add' | 'remove'
) {
    try {
        const { userId, guestId } = await getIdentity();
        const uniqueWhere = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.favorite.findUnique({
            where: uniqueWhere,
        });
        let operation: 'create' | 'delete' | 'none' = 'none';

        if (intent === 'remove') operation = existing ? 'delete' : 'none';
        else if (intent === 'add') operation = !existing ? 'create' : 'none';
        else operation = existing ? 'delete' : 'create';

        if (operation === 'delete') {
            const deleteWhere = userId
                ? { productId, userId }
                : { productId, guestId: guestId! };
            await prisma.favorite.deleteMany({ where: deleteWhere });
        } else if (operation === 'create') {
            await prisma.favorite.create({
                data: { productId, userId, guestId },
            });
        }

        if (operation !== 'none') revalidatePath('/profile');

        const finalState =
            operation === 'delete' || (intent === 'remove' && !existing)
                ? 'removed'
                : 'added';
        return { success: true, action: finalState };
    } catch (error: unknown) {
        if (
            isNextDynamicError(error) &&
            error.digest === 'DYNAMIC_SERVER_USAGE'
        )
            throw error;
        console.error(
            '[TOGGLE_FAVORITE_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { success: false, error: 'Failed to sync favorite' };
    }
}

export async function toggleCartAction(
    productId: string,
    intent?: 'add' | 'remove'
) {
    try {
        const { userId, guestId } = await getIdentity();
        const uniqueWhere = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.cartItem.findUnique({
            where: uniqueWhere,
        });
        let operation: 'create' | 'delete' | 'none' = 'none';

        if (intent === 'remove') operation = existing ? 'delete' : 'none';
        else if (intent === 'add') operation = !existing ? 'create' : 'none';
        else operation = existing ? 'delete' : 'create';

        if (operation === 'delete') {
            const deleteWhere = userId
                ? { productId, userId }
                : { productId, guestId: guestId! };
            await prisma.cartItem.deleteMany({ where: deleteWhere });
        } else if (operation === 'create') {
            await prisma.cartItem.create({
                data: { productId, userId, guestId },
            });
        }

        if (operation !== 'none') revalidatePath('/profile');

        const finalState =
            operation === 'delete' || (intent === 'remove' && !existing)
                ? 'removed'
                : 'added';
        return { success: true, action: finalState };
    } catch (error: unknown) {
        if (
            isNextDynamicError(error) &&
            error.digest === 'DYNAMIC_SERVER_USAGE'
        )
            throw error;
        console.error(
            '[TOGGLE_CART_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { success: false, error: 'Failed to sync cart' };
    }
}

export async function getShopState(): Promise<{
    cart: StoreProduct[];
    favorites: StoreProduct[];
}> {
    try {
        const { userId, guestId } = await getIdentity();
        const whereClause = userId ? { userId } : { guestId: guestId! };

        const [cartData, favoritesData] = await Promise.all([
            prisma.cartItem.findMany({
                where: whereClause,
                include: { product: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.favorite.findMany({
                where: whereClause,
                include: { product: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            cart: cartData.map(mapToStoreProduct),
            favorites: favoritesData.map(mapToStoreProduct),
        };
    } catch (error: unknown) {
        if (
            isNextDynamicError(error) &&
            error.digest === 'DYNAMIC_SERVER_USAGE'
        )
            throw error;
        console.error(
            '[GET_SHOP_STATE_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { cart: [], favorites: [] };
    }
}
