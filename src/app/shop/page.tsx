import { ProductCard } from '@/components/shared/shop/product-card/product-card';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type SearchParams = {
    [key: string]: string | string[] | undefined;
};

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const resolvedParams = await searchParams;
    const rawCategory = resolvedParams.category;

    if (Array.isArray(rawCategory)) {
        redirect(`/shop?category=${rawCategory[0]}`);
    }

    const activeCategory = rawCategory;

    const [categories, products] = await Promise.all([
        prisma.category.findMany({
            orderBy: { name: 'asc' },
        }),
        prisma.product.findMany({
            ...(activeCategory && {
                where: { category: { slug: activeCategory } },
            }),
            orderBy: { createdAt: 'desc' },
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
        }),
    ]);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold uppercase tracking-tighter mb-4">
                    Shop Archive
                </h1>
                <p className="text-muted-foreground">
                    Уникальные изделия 1-of-1. Каждая вещь существует в
                    единственном экземпляре.
                </p>
            </div>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                    href="/shop"
                    className={cn(
                        'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                        !activeCategory
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                >
                    Все
                </Link>
                {categories.map(category => (
                    <Link
                        key={category.id}
                        href={`/shop?category=${category.slug}`}
                        className={cn(
                            'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                            activeCategory === category.slug
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        )}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="text-xl font-medium text-muted-foreground">
                        В этой категории пока нет товаров.
                    </p>
                    <Link
                        href="/shop"
                        className="mt-4 text-sm underline underline-offset-4"
                    >
                        Сбросить фильтр
                    </Link>
                </div>
            )}
        </div>
    );
}
