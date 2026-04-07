'use client';

import { useEffect, useState } from 'react';
import { UnitsCounter } from './units-counter';

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: {
        products: number;
    };
}

export function StickyNav({ categories }: { categories: Category[] }) {
    const [activeSlug, setActiveSlug] = useState<string | null>(null);

    useEffect(() => {
        // Защита от пустого массива
        if (categories.length === 0) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 106;

            let currentActive: string | null = null;

            for (const category of categories) {
                const section = document.getElementById(category.slug);
                if (!section) continue;

                // Если верхняя граница секции пересекла нашу "линию видимости"
                if (section.offsetTop <= scrollPosition) {
                    currentActive = category.slug;
                }
            }

            // Fallback: если мы в самом верху страницы, подсвечиваем первую категорию
            if (!currentActive && window.scrollY < 100) {
                currentActive = categories[0].slug;
            }

            setActiveSlug(currentActive);
        };

        // passive: true критически важно для производительности скролла (защита от лагов)
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Принудительный вызов при монтировании, чтобы сразу подсветить активную категорию
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    return (
        <nav className="flex items-center h-14 overflow-x-auto whitespace-nowrap no-scrollbar snap-x gap-8">
            {categories.map(category => (
                <a
                    key={category.id}
                    href={`#${category.slug}`}
                    className={`text-sm font-medium snap-start uppercase tracking-wider font-jane
                        border rounded-full px-4 py-2 relative
                        transition-all duration-500 group
                        hover:text-amber-500 hover:text-shadow-sm hover:border-amber-500 hover:bg-gray-200 hover:shadow-sm hover:shadow-black/30
                        ${
                            activeSlug === category.slug
                                ? 'text-amber-500 border-amber-500 bg-gray-200 shadow-sm shadow-black/30 text-shadow-sm duration-100'
                                : 'text-muted-foreground border-amber-300 '
                        }
                    `}
                >
                    {category.name}
                    <UnitsCounter
                        units={category._count.products}
                        classWrapper="-top-1 right-0"
                        classUnits=""
                    />
                </a>
            ))}
        </nav>
    );
}
