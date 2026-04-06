// src/components/shop/category-section.tsx
'use client';

import { ChevronUp, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { getMoreProductsByCategory } from '@/actions/shop';
import { ProductCard } from '@/components/shared/shop/product-card/product-card';
import { Button } from '@/components/ui/button';
import { ProductCardData } from '@/types/product';

interface CategorySectionProps {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    initialProducts: ProductCardData[];
    totalAvailable: number;
}

// 2. Определяем варианты анимации (Variants)
// Варианты для контейнера (управляют высотой и каскадом)
const containerVariants = {
    collapsed: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }, // Плавная кривая
            opacity: { duration: 0.25 },
            when: 'afterChildren', // Сначала анимируем исчезновение детей
            staggerChildren: 0.05, // Каскад при закрытии
            staggerDirection: -1, // Закрываем снизу вверх
        },
    },
    expanded: {
        height: 'auto',
        opacity: 1,
        transition: {
            height: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] },
            opacity: { duration: 0.3 },
            when: 'beforeChildren', // Сначала открываем контейнер, потом детей
            staggerChildren: 0.1, // Эффект  карточки вылетают по очереди
        },
    },
};

// Варианты для каждой отдельной карточки внутри аккордеона
const cardVariants = {
    collapsed: {
        y: 20, // Карточка уходит вниз
        opacity: 0,
        scale: 0.95, // Немного уменьшается
        transition: { duration: 0.3 },
    },
    expanded: {
        y: 0, // Встает на место
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const, // Пружинная анимация для премиальности
            stiffness: 100,
            damping: 15,
        },
    },
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
    const [hasFetchedAll, setHasFetchedAll] = useState(false);

    const [isPending, startTransition] = useTransition();

    const showToggleButton = totalAvailable > 4;

    // 3. ЛОГИКА РАЗДЕЛЕНИЯ ТОВАРОВ

    const staticProducts = products.slice(0, 4); // Всегда видны
    const remainingProducts = products.slice(4); // Анимируются внутри аккордеона

    const handleToggle = () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        if (hasFetchedAll) {
            setIsExpanded(true);
            return;
        }

        startTransition(async () => {
            const result = await getMoreProductsByCategory(categoryId, 4);

            // 1. ПРОВЕРЯЕМ ТОЛЬКО МАРКЕР УСПЕХА
            if (result.success) {
                setProducts(prev => [...prev, ...result.data]);
                setHasFetchedAll(true);
                setIsExpanded(true);
            } else {
                toast.error('Ошибка загрузки архива', {
                    description: result.error,
                });
            }
        });
    };

    return (
        <section id={categorySlug} className="w-full pt-16   scroll-mt-24">
            {/* ЗАГОЛОВОК КАТЕГОРИИ */}
            <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight uppercase relative text-shadow-xl shadow-black/90 font-jane">
                    {categoryName}
                    <span className="text-xs  bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-amber-500 shadow-black/90 absolute -top-2 -right-5">
                        {totalAvailable}
                    </span>
                </h2>
            </div>

            {/* ГРИД ДЛЯ ПЕРВЫХ 4 КАРТОЧЕК (Статический) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
                {staticProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        // LCP оптимизация остается
                        priority={index < 2 && !isExpanded}
                    />
                ))}
            </div>

            {/* ГРИД ДЛЯ ОСТАЛЬНЫХ КАРТОЧЕК (С анимацией) */}
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
                        {/* Вложенный грид*/}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 pt-10 relative">
                            {remainingProducts.map(product => (
                                <motion.div
                                    key={product.id}
                                    variants={cardVariants}
                                    layout // Помогает сгладить репозиционирование
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* КНОПКА УПРАВЛЕНИЯ */}
            {showToggleButton && (
                <div className="mt-12 flex justify-center relative z-10">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleToggle}
                        disabled={isPending}
                        className="min-w-[200px] uppercase tracking-widest text-xs rounded-full shadow-md 
                        backdrop-blur-sm bg-background/50 font-jane text-amber-500 text-shadow-lg 
                        transition-all duration-300
                        hover:shadow-lg hover:text-amber-500 hover:text-shadow-lg hover:border-amber-500 hover:bg-gray-200 cursor-pointer"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                {isExpanded
                                    ? 'Collapse'
                                    : `Show all (${totalAvailable - 4})`}
                                <ChevronUp
                                    className={`ml-2 h-4 w-4 transition-transform duration-300  ${
                                        isExpanded ? 'rotate-0' : 'rotate-180'
                                    }`}
                                />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </section>
    );
}
