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
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
                // Загружаем все товары (включая SOLD/RESERVED), чтобы использовать как витрину-архив
            },
            skip: skip,
            orderBy: [
                { status: 'asc' }, // AVAILABLE всегда будут выше, чем SOLD
                { createdAt: 'desc' },
            ],
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
