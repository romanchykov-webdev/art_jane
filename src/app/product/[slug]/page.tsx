import { ProductGallery } from '@/components/shared/product-page/product-gallery/product-gallery';
import { prisma } from '@/lib/prisma';
import { StorageFolder } from '@/lib/supabase-paths';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';

import { ProductInfo } from '@/components/shared/product-page/product-info';

import { ProductRecommendations } from '@/components/shared/product-page/product-recommendations';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Простой скелетон для блока рекомендаций
function RecommendationsSkeleton() {
    return (
        <div className="border-t border-border pt-16 mt-8">
            <div className="h-10 w-64 bg-muted animate-pulse mx-auto mb-10 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="aspect-3/4 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}

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
        select: {
            id: true,
            title: true,
            price: true,
            description: true,
            size: true,
            status: true,
            categoryId: true,
            thumbnailFront: true,
            thumbnailBack: true,
            sequenceFolder: true,
            sequenceFrameCount: true,
            category: {
                select: { name: true },
            },
        },
    });

    if (!product) {
        notFound();
    }

    // 4. СБОР ИЗОБРАЖЕНИЙ (убираем возможные null)
    const productImages = [
        product.thumbnailFront,
        product.thumbnailBack,
    ].filter(Boolean) as string[];

    // 5. ПОДГОТОВКА DTO ДЛЯ КЛИЕНТА
    const productInfoData = {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        size: product.size,
        status: product.status,
        category: product.category,
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl flex flex-col gap-24">
            <Link
                href="/"
                className="w-20 h-20 flex items-center justify-center rounded-full bg-amber-500 shadow-even-md
                 hover:bg-amber-600 transition-all duration-500 hover:shadow-even-lg
                 "
            >
                <HomeIcon className="size-10" />
            </Link>

            {/* ГЛАВНЫЙ БЛОК: Split-Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 relative">
                {/* ЛЕВАЯ КОЛОНКА: Галерея (Залипающая) */}
                <ProductGallery
                    images={productImages}
                    title={product.title}
                    hasThreeSixty={true} // Можно включить жестко для теста
                    sequenceFolder={product.sequenceFolder as StorageFolder}
                    sequenceFrameCount={product.sequenceFrameCount}
                />

                {/* ПРАВАЯ КОЛОНКА */}
                <ProductInfo product={productInfoData} />
            </div>

            {/* БЛОК РЕКОМЕНДАЦИЙ  */}
            <Suspense fallback={<RecommendationsSkeleton />}>
                <ProductRecommendations
                    categoryId={product.categoryId}
                    currentProductId={product.id}
                />
            </Suspense>
        </div>
    );
}
