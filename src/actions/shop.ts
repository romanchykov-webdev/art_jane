'use server';

import { prisma } from '@/lib/prisma';
import { ProductCardData } from '@/types/product';

export type GetMoreProductsResult =
    | { success: true; data: ProductCardData[] }
    | { success: false; error: string };

export async function getMoreProductsByCategory(
    categoryId: string,
    skip: number = 4,
    take: number = 12
): Promise<GetMoreProductsResult> {
    // 1. SECURITY GUARD
    if (
        !categoryId ||
        typeof categoryId !== 'string' ||
        categoryId.length > 50
    ) {
        return { success: false, error: 'Неверный идентификатор категории' };
    }

    // 2. SECURITY GUARD: Защита от отрицательной пагинации и перегрузки базы
    if (typeof skip !== 'number' || skip < 0 || skip > 1000) {
        return { success: false, error: 'Неверный параметр skip' };
    }

    // Защита от слишком большого take (максимум 50 за раз)
    if (typeof take !== 'number' || take < 1 || take > 50) {
        return { success: false, error: 'Неверный параметр take' };
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
            },
            skip: skip,
            take: take,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                status: true,
                thumbnailFront: true,
                thumbnailBack: true,
                size: true,
                favoriteCount: true,
                category: {
                    select: { name: true },
                },
            },
        });

        return { success: true, data: products };
    } catch (error) {
        console.error('[getMoreProductsByCategory_ERROR]', error);
        return {
            success: false,
            error: 'Не удалось загрузить дополнительные товары',
        };
    }
}
