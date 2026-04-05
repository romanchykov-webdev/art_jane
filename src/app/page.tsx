import { ProductSequence } from '@/components/shared/canvas/product-sequence';
import { ProductCard } from '@/components/shared/shop/product-card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// force-dynamic обязателен: статусы 1-of-1 изделий меняются моментально
// ISR дал бы stale "AVAILABLE" для уже проданного уникального экземпляра
export const dynamic = 'force-dynamic';

export default async function Home() {
    const products = await prisma.product.findMany({
        where: { status: 'AVAILABLE' }, // показываем только доступные на главной
        orderBy: { createdAt: 'desc' },
        take: 3,
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

    return (
        <>
            {/* Client Component — Canvas-анимация, RSC-граница не нарушена */}
            <ProductSequence folderName="sequence" frameCount={174} />

            <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 py-24 bg-background">
                <div className="flex items-baseline justify-between mb-12">
                    <h2 className="text-3xl font-semibold tracking-tight">
                        Уникальные экземпляры
                    </h2>
                    <Link
                        href="/shop"
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                        Смотреть все →
                    </Link>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, i) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                priority={i === 0}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="py-16 text-center text-muted-foreground text-sm tracking-wide uppercase">
                        Новые работы скоро появятся
                    </p>
                )}
            </section>
        </>
    );
}
