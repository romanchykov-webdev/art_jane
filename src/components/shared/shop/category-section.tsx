'use client';

import { ChevronUp, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { getMoreProductsByCategory } from '@/actions/shop';
import { ProductCard } from '@/components/shared/shop/product-card/product-card';
import { Button } from '@/components/ui/button';
import { ProductCardData } from '@/types/product';

import { UnitsCounter } from './units-counter';

import { Variants } from 'framer-motion';

// КОНСТАНТЫ
const FETCH_LIMIT = 4;
const INITIAL_DISPLAY_COUNT = 4;

interface CategorySectionProps {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    initialProducts: ProductCardData[];
    totalAvailable: number;
}

const containerVariants: Variants = {
    collapsed: {
        height: 0,
        opacity: 1,
        transition: {
            height: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] as const },
            opacity: { duration: 0.4 },
        },
    },
    expanded: {
        height: 'auto',
        opacity: 1,
        transition: {
            height: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] as const },
            opacity: { duration: 0.3 },
        },
    },
};

const cardVariants: Variants = {
    collapsed: { y: 20, opacity: 0, scale: 0.95 },
    expanded: (index: number) => ({
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            // задержка сбрасывается для каждой новой загруженной партии
            delay: (index % FETCH_LIMIT) * 0.1,
        },
    }),
};

export function CategorySection({
    categoryId,
    categoryName,
    categorySlug,
    initialProducts,
    totalAvailable,
}: CategorySectionProps) {
    const [products, setProducts] =
        useState<ProductCardData[]>(initialProducts);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();

    // 1. ИЗОЛИРОВАННЫЙ СТЕЙТ hasMore (Защита от бесконечной кнопки)
    const [hasMore, setHasMore] = useState(
        totalAvailable > INITIAL_DISPLAY_COUNT
    );

    const showToggleButton = totalAvailable > INITIAL_DISPLAY_COUNT;
    const staticProducts = products.slice(0, INITIAL_DISPLAY_COUNT);
    const remainingProducts = products.slice(INITIAL_DISPLAY_COUNT);

    const loadMoreProducts = async () => {
        const result = await getMoreProductsByCategory(
            categoryId,
            products.length,
            FETCH_LIMIT
        );

        if (result.success) {
            setProducts(prev => [...prev, ...result.data]);

            // Если сервер отдал меньше товаров, чем мы просили, значит данных больше нет
            if (result.data.length < FETCH_LIMIT) {
                setHasMore(false);
            }
        } else {
            toast.error('Ошибка загрузки', {
                description: result.error,
            });
        }
    };

    const handleToggle = () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        setIsExpanded(true);

        // Если мы открываем в первый раз и есть еще товары — грузим первую порцию
        if (products.length === INITIAL_DISPLAY_COUNT && hasMore) {
            startTransition(loadMoreProducts);
        }
    };

    const handleLoadMore = () => {
        startTransition(loadMoreProducts);
    };

    return (
        <section id={categorySlug} className="w-full pt-16 scroll-mt-24">
            <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight uppercase relative text-shadow-xl shadow-black/90 font-jane">
                    {categoryName}
                    <span className="absolute top-0 -right-2">
                        <UnitsCounter units={totalAvailable} />
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
                {staticProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 2 && !isExpanded}
                    />
                ))}
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && remainingProducts.length > 0 && (
                    <motion.div
                        key="accordion-content"
                        variants={containerVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden pb-5 px-2"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 pt-10 relative">
                            {remainingProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    custom={index} // Передаем индекс в variants для расчета задержки
                                    variants={cardVariants}
                                    initial="collapsed" // Форсируем старт снизу
                                    animate="expanded" // Форсируем анимацию наверх
                                    layout
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                <motion.div
                    key="accordion-content"
                    variants={containerVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="overflow-hidden pb-5 px-2 flex items-center justify-around flex-wrap"
                >
                    {/* hasMore button */}
                    {isExpanded && hasMore && (
                        <div className="mt-12 flex justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleLoadMore}
                                disabled={isPending}
                                className="min-w-[200px] uppercase tracking-widest text-xs rounded-full shadow-md 
                                    backdrop-blur-sm bg-background/50 font-jane text-amber-500 text-shadow-lg 
                                    transition-all duration-300 hover:shadow-lg hover:border-amber-500 hover:bg-gray-200 cursor-pointer"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    // Math.max защищает от отрицательных чисел, если админ удалит товар во время сессии
                                    `Load more (${Math.max(0, totalAvailable - products.length)})`
                                )}
                            </Button>
                        </div>
                    )}

                    {/* open accordion button */}
                    {showToggleButton && (
                        <div className="mt-12 flex justify-center relative z-10">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleToggle}
                                disabled={isPending} // Жесткая блокировка во время любой загрузки
                                className="min-w-[200px] uppercase tracking-widest text-xs rounded-full shadow-md 
                        backdrop-blur-sm bg-background/50 font-jane text-amber-500 text-shadow-lg 
                        transition-all duration-300 hover:shadow-lg hover:border-amber-500 hover:bg-gray-200 cursor-pointer"
                            >
                                {isExpanded
                                    ? 'Collapse'
                                    : `Show all (${totalAvailable - INITIAL_DISPLAY_COUNT})`}
                                <ChevronUp
                                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                                        isExpanded ? 'rotate-0' : 'rotate-180'
                                    }`}
                                />
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
