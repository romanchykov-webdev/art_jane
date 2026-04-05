// src/app/page.tsx
import { ProductSequence } from '@/components/shared/canvas/product-sequence';
import { CategorySection } from '@/components/shared/shop/category-section';
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
                    <nav className="flex items-center h-14 overflow-x-auto whitespace-nowrap no-scrollbar snap-x gap-8">
                        {categoriesWithProducts.map(category => (
                            <a
                                key={category.id}
                                href={`#${category.slug}`}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors snap-start uppercase tracking-wider"
                            >
                                {category.name}
                                <span className="ml-2 text-[10px] text-muted-foreground/70">
                                    {category._count.products}
                                </span>
                            </a>
                        ))}
                    </nav>
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
                            Архив пуст. Новые работы скоро появятся.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
