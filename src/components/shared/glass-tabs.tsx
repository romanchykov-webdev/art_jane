'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface GlassTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export function GlassTabs({
    tabs,
    activeTab,
    onChange,
    className,
}: GlassTabsProps) {
    // Стейт для хранения позиции и ширины белой плашки
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 4, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Эффект, который вычисляет позицию при смене вкладки
    useEffect(() => {
        const activeIndex = tabs.findIndex(t => t.id === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];

        if (activeTabElement) {
            // offsetLeft и offsetWidth работают идеально даже внутри анимированных модалок
            setIndicatorStyle({
                left: activeTabElement.offsetLeft,
                width: activeTabElement.offsetWidth,
            });
        }
    }, [activeTab, tabs]);

    return (
        // ВНЕШНИЙ СЛОЙ
        <div
            className={cn(
                'flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg z-20',
                className
            )}
        >
            {/* ВНУТРЕННИЙ СЛОЙ (Контейнер для позиционирования) */}
            <div
                ref={containerRef}
                className="relative flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg"
            >
                {/* ЕДИНСТВЕННЫЙ ИНДИКАТОР НА УРОВНЕ КОНТЕЙНЕРА 
                    Он больше не пересоздается, а просто ездит влево-вправо
                */}
                <motion.div
                    className="absolute top-1 bottom-1 bg-white rounded-full shadow-md z-0"
                    initial={false} // Отключаем анимацию при первой загрузке
                    animate={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 35,
                    }}
                />

                {/* РЕНДЕР КНОПОК */}
                {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            // Сохраняем ссылку на DOM-элемент кнопки
                            ref={el => {
                                tabRefs.current[index] = el;
                            }}
                            onClick={() => onChange(tab.id)}
                            disabled={tab.disabled}
                            className={cn(
                                'relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 font-jane outline-none flex items-center justify-center gap-2',
                                isActive
                                    ? 'text-black'
                                    : 'text-white/70 hover:text-white',
                                tab.disabled &&
                                    'opacity-30 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
