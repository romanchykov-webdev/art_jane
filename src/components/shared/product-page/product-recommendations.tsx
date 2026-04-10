import { ProductCard } from '@/components/shared/shop/product-card/product-card';
import { prisma } from '@/lib/prisma';

interface ProductRecommendationsProps {
    categoryId: string | null;
    currentProductId: string;
}

export async function ProductRecommendations({
    categoryId,
    currentProductId,
}: ProductRecommendationsProps) {
    if (!categoryId) return null;

    // ШАГ 1: База  выбирает 4 случайных ID.
    const randomRecords = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE "categoryId" != ${categoryId}
          AND status = 'AVAILABLE'
          AND id != ${currentProductId}
        ORDER BY RANDOM()
        LIMIT 4;
    `;

    // Если база пустая или подходящих товаров нет
    if (!randomRecords || randomRecords.length === 0) return null;

    // Достаем массив ID
    const ids = randomRecords.map(record => record.id);

    // ШАГ 2: Достаем полные типизированные данные
    const recommendedProducts = await prisma.product.findMany({
        where: {
            id: { in: ids },
        },
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
            category: { select: { name: true } },
        },
    });

    if (recommendedProducts.length === 0) return null;

    return (
        <section className="border-t border-border pt-16 mt-8">
            <h2 className="text-3xl font-bold tracking-tight uppercase font-jane mb-10 text-center">
                Complete the Look
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
                {recommendedProducts.map(recProduct => (
                    <ProductCard key={recProduct.id} product={recProduct} />
                ))}
            </div>
        </section>
    );
}
