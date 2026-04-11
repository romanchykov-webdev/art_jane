import { HeroSequence } from '@/components/shared/hero-sequence';
import { CategorySection } from '@/components/shared/shop/category-section';
import { StickyNav } from '@/components/shared/shop/sticky-nav';
import { prisma } from '@/lib/prisma';
import { StorageFolder } from '@/lib/supabase-paths';

export const dynamic = 'force-dynamic';

export default async function Home() {
    // 1. ОПТИМИЗАЦИЯ: Выполняем запросы параллельно через Promise.all
    const [categoriesWithProducts, settings] = await Promise.all([
        // Запрос 1: Категории и товары
        prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
                products: {
                    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
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
        }),
        // Запрос 2: Глобальные настройки витрины
        prisma.siteSettings
            .findUnique({
                where: { id: 'global' },
            })
            .catch(err => {
                console.error(
                    '[DATABASE_ERROR] Failed to fetch site settings:',
                    err
                );
                return null;
            }),
    ]);

    // 2. ФОЛЛБЭКИ: Если настроек еще нет в базе, используем дефолтные значения
    const sequenceFolder: StorageFolder =
        (settings?.heroSequenceFolder as StorageFolder) ?? 'sequence';
    const sequenceFrameCount = settings?.heroSequenceFrameCount ?? 174;

    return (
        <>
            {/* Клиентский Canvas*/}
            <HeroSequence
                folderName={sequenceFolder}
                frameCount={sequenceFrameCount}
            />

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
