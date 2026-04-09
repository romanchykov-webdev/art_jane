import { ProductGallery } from '@/components/product-page/product-gallery';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';

// В Next.js 15 params — это Promise!
interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    // 1. Распаковываем параметры
    const { slug } = await params;

    // 2. Запрашиваем главный товар
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
        },
    });

    if (!product) {
        notFound();
    }

    const isAvailable = product.status === 'AVAILABLE';

    // 3. Запрашиваем товары для "Собери лук" (из других категорий)
    const allOtherAvailableProducts = await prisma.product.findMany({
        where: {
            categoryId: { not: product.categoryId },
            status: 'AVAILABLE',
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
            category: {
                select: { name: true },
            },
        },
    });

    // Перемешиваем и берем 4 случайных
    // const recommendedProducts = allOtherAvailableProducts
    //     .sort(() => 0.5 - Math.random())
    //     .slice(0, 4);

    // 2. Собери массив изображений (пока берем превьюшки, позже добавишь поле gallery в БД)
    const productImages = [
        product.thumbnailFront,
        product.thumbnailBack,
        // В будущем тут будет: ...product.gallery
    ];

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl flex flex-col gap-24">
            {/* ГЛАВНЫЙ БЛОК: Split-Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 relative">
                {/* ЛЕВАЯ КОЛОНКА: Галерея (Залипающая) */}
                <ProductGallery
                    images={productImages}
                    title={product.title}
                    hasThreeSixty={true}
                />

                {/* ПРАВАЯ КОЛОНКА: Контент */}
                <div className="flex flex-col pt-4">
                    {product.category && (
                        <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                            {product.category.name}
                        </span>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase font-jane mb-6">
                        {product.title}
                    </h1>

                    <div className="text-3xl font-bold mb-8">
                        {formatPrice(product.price)}
                    </div>

                    {product.description ? (
                        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                            {product.description}
                        </p>
                    ) : (
                        <p className="text-lg text-muted-foreground mb-12 leading-relaxed italic">
                            Описание временно отсутствует.
                        </p>
                    )}

                    <div className="border-t border-border py-6 mb-8">
                        <div className="flex justify-between items-center uppercase tracking-wider text-sm">
                            <span className="text-muted-foreground">Size</span>
                            <span className="font-bold text-lg">
                                {product.size}
                            </span>
                        </div>
                    </div>

                    {/*  кнопки CTA */}
                    <button
                        disabled={!isAvailable}
                        className={`w-full py-6 rounded-xl uppercase tracking-widest font-bold text-lg transition-all duration-300 ${
                            isAvailable
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                    >
                        {isAvailable ? 'Reserve / Buy 1-of-1' : 'Sold Out'}
                    </button>
                </div>
            </div>

            {/* БЛОК РЕКОМЕНДАЦИЙ: Complete the look */}
            {/* {recommendedProducts.length > 0 && (
                <section className="border-t border-border pt-16 mt-8">
                    <h2 className="text-3xl font-bold tracking-tight uppercase font-jane mb-10 text-center">
                        Complete the Look
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
                        {recommendedProducts.map(recProduct => (
                            <ProductCard
                                key={recProduct.id}
                                product={recProduct}
                            />
                        ))}
                    </div>
                </section>
            )} */}
        </div>
    );
}
