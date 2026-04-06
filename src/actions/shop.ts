'use server';

import { prisma } from '@/lib/prisma';
import { ProductCardData } from '@/types/product';

export type GetMoreProductsResult =
    | { success: true; data: ProductCardData[] }
    | { success: false; error: string };

export async function getMoreProductsByCategory(
    categoryId: string,
    skip: number = 4
): Promise<GetMoreProductsResult> {
    // 1. SECURITY GUARD: Защита от неверного формата категории
    if (
        !categoryId ||
        typeof categoryId !== 'string' ||
        categoryId.length > 50
    ) {
        return { success: false, error: 'Неверный идентификатор категории' };
    }

    // 2. SECURITY GUARD: Защита от отрицательной пагинации и перегрузки базы
    if (typeof skip !== 'number' || skip < 0 || skip > 1000) {
        return { success: false, error: 'Неверный параметр пагинации' };
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
            },
            skip: skip,
            // take: 12,
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
                    select: {
                        name: true,
                    },
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
