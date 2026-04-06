'use client';

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { getMoreProductsByCategory } from '@/actions/shop';
import { ProductCard } from '@/components/shared/shop/product-card';
import { Button } from '@/components/ui/button';
import { ProductCardProps } from '@/types/product';

// Извлекаем тип продукта из пропсов карточки для строгой типизации
type Product = ProductCardProps['product'];

interface CategorySectionProps {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    initialProducts: Product[];
    totalAvailable: number; // Общее количество доступных товаров в базе
}

export function CategorySection({
    categoryId,
    categoryName,
    categorySlug,
    initialProducts,
    totalAvailable,
}: CategorySectionProps) {
    // STATE MACHINE
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasFetchedAll, setHasFetchedAll] = useState(false);

    // React 19 Transition Hook для Server Actions
    const [isPending, startTransition] = useTransition();

    // Определяем, нужно ли вообще показывать кнопку "Развернуть"
    const showToggleButton = totalAvailable > 4;

    // Вычисляем, какие товары рендерить прямо сейчас
    const visibleProducts = isExpanded ? products : products.slice(0, 4);

    const handleToggle = () => {
        // СЦЕНАРИЙ 1: Свернуть
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        // СЦЕНАРИЙ 2: Развернуть (данные уже скачаны)
        if (hasFetchedAll) {
            setIsExpanded(true);
            return;
        }

        // СЦЕНАРИЙ 3: Развернуть (нужно скачать данные)
        startTransition(async () => {
            // Вызываем наш Server Action
            const result = await getMoreProductsByCategory(categoryId, 4);

            if (result.success && result.data) {
                setProducts(prev => [
                    ...prev,
                    ...(result.data as unknown as Product[]),
                ]);
                setHasFetchedAll(true);
                setIsExpanded(true);
            } else {
                // TODO: toast из shadcn/ui
                console.error(result.error);
            }
        });
    };

    return (
        <section id={categorySlug} className="w-full pt-16 scroll-mt-24">
            {/* ЗАГОЛОВОК КАТЕГОРИИ */}
            <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight uppercase relative text-shadow-xl shadow-black/90 font-jane">
                    {categoryName}
                    <span className="text-xs  bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-amber-500 shadow-black/90 absolute -top-2 -right-5">
                        {totalAvailable}
                    </span>
                </h2>
            </div>

            {/* СЕТКА ТОВАРОВ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 transition-all duration-500">
                {visibleProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        // LCP оптимизация: приоритет только для первых двух карточек
                        priority={index < 2 && !isExpanded}
                    />
                ))}
            </div>

            {/* КНОПКА УПРАВЛЕНИЯ (Показывается только если товаров больше 4) */}
            {showToggleButton && (
                <div className="mt-12 flex justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleToggle}
                        disabled={isPending}
                        className="min-w-[200px] uppercase tracking-widest text-xs"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Загрузка...
                            </>
                        ) : isExpanded ? (
                            <>
                                Свернуть <ChevronUp className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Показать все ({totalAvailable}){' '}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </section>
    );
}
// [NITPICKS]
// В идеале, обработку ошибок от getMoreProductsByCategory стоит связать с useToast из shadcn/ui, чтобы пользователь видел красивое всплывающее уведомление, если интернет отвалится во время загрузки.
