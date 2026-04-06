// src/app/page.tsx
import { ProductSequence } from '@/components/shared/canvas/product-sequence';
import { CategorySection } from '@/components/shared/shop/category-section';
import { StickyNav } from '@/components/shared/shop/sticky-nav';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
    // 1. Тянем категории, счетчик и первые 4 товара
    const categoriesWithProducts = await prisma.category.findMany({
        where: {
            products: {
                some: { status: 'AVAILABLE' }, // Берем ТОЛЬКО категории, где есть доступные товары
            },
        },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            // Считаем общее количество доступных товаров в категории
            _count: {
                select: {
                    products: { where: { status: 'AVAILABLE' } },
                },
            },
            // Вкладываем первые 4 товара
            products: {
                where: { status: 'AVAILABLE' },
                orderBy: { createdAt: 'desc' },
                take: 4,
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
            },
        },
    });

    return (
        <>
            {/* Клиентский Canvas*/}
            <ProductSequence folderName="sequence" frameCount={174} />

            {/* STICKY НАВИГАЦИЯ (Lookbook Menu) */}
            <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur border-b border-border/40">
                <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
                    <StickyNav categories={categoriesWithProducts} />
                </div>
            </div>

            {/* РЕНДЕР КАТЕГОРИЙ */}
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-24">
                {categoriesWithProducts.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        {categoriesWithProducts.map(category => (
                            <CategorySection
                                key={category.id}
                                categoryId={category.id}
                                categoryName={category.name}
                                categorySlug={category.slug}
                                initialProducts={category.products}
                                totalAvailable={category._count.products}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <p className="text-muted-foreground text-sm tracking-wide uppercase">
                            The archive is empty. New works will appear soon.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
