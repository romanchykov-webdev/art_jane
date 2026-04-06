'use server';

import { prisma } from '@/lib/prisma';

export async function getMoreProductsByCategory(
    categoryId: string,
    skip: number = 4
) {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
                // status: 'AVAILABLE',
            },
            skip: skip, // Пропускаем первые 4 товара, которые уже отрендерил сервер
            orderBy: [
                { status: 'asc' }, // ← такой же порядок как в page.tsx
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

        // Возвращаем структурированный ответ для безопасной обработки на клиенте
        return { success: true, data: products };
    } catch (error) {
        console.error('[getMoreProductsByCategory_ERROR]', error);
        return {
            success: false,
            error: 'Не удалось загрузить дополнительные товары',
        };
    }
}
