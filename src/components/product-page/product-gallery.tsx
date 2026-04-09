'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Box,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    MoveHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: string[];
    title: string;
    hasThreeSixty?: boolean; // Флаг наличия 3D модели
}

export function ProductGallery({
    images,
    title,
    hasThreeSixty = false, // По умолчанию false, пока не подключим Canvas
}: ProductGalleryProps) {
    const [activeMode, setActiveMode] = useState<'photo' | '3d'>('photo');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Стейт для мобильной подсказки "Swipe"
    const [showHint, setShowHint] = useState(true);

    // Вычисляем ширину прогресс-бара
    const progressPercentage = ((currentIndex + 1) / images.length) * 100;

    // Навигация
    const handleNext = () => {
        setShowHint(false);
        setCurrentIndex(prev => (prev + 1 === images.length ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setShowHint(false);
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // Настройки физики свайпа для Framer Motion
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="relative flex flex-col gap-4 w-full">
            {/* ГЛАВНЫЙ КОНТЕЙНЕР (Залипающий) */}
            <div className="relative">
                <div className="md:sticky md:top-24 aspect-3/4 w-full rounded-2xl overflow-hidden bg-muted relative shadow-even-lg group">
                    {/* РЕЖИМ: ФОТО */}
                    {activeMode === 'photo' && (
                        <>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: 'easeInOut',
                                    }}
                                    className="absolute inset-0"
                                    //  ФИЗИКА СВАЙПА
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.1} // Легкая пружинистость за пальцем
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = swipePower(
                                            offset.x,
                                            velocity.x
                                        );
                                        if (swipe < -swipeConfidenceThreshold) {
                                            handleNext(); // Свайп влево -> след. фото
                                        } else if (
                                            swipe > swipeConfidenceThreshold
                                        ) {
                                            handlePrev(); // Свайп вправо -> пред. фото
                                        }
                                    }}
                                >
                                    <Image
                                        src={images[currentIndex]}
                                        alt={`${title} - view ${currentIndex + 1}`}
                                        fill
                                        priority={currentIndex === 0}
                                        className="object-cover rounded-2xl"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* ЗОНЫ КЛИКА  */}
                            {images.length > 1 && (
                                <>
                                    {/* МОБИЛЬНАЯ ПОДСКАЗКА */}
                                    <AnimatePresence>
                                        {showHint && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 md:hidden pointer-events-none"
                                            >
                                                <motion.div
                                                    animate={{
                                                        x: [-15, 15, -15],
                                                    }} // Движение влево-вправо
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                        ease: 'easeInOut',
                                                    }}
                                                    className="flex flex-col opacity-90 items-center gap-2 text-white drop-shadow-xl p-4 bg-black/20 backdrop-blur-md rounded-2xl"
                                                >
                                                    <MoveHorizontal className="w-8 h-8" />
                                                    <span className="font-jane uppercase tracking-widest text-xs">
                                                        Swipe
                                                    </span>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ЗОНЫ КЛИКА ДЛЯ ДЕСКТОПА */}
                                    <div
                                        className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize z-10 hidden md:block"
                                        onClick={handlePrev}
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize z-10 hidden md:block"
                                        onClick={handleNext}
                                    />

                                    {/* ВИЗУАЛЬНЫЕ СТРЕЛКИ ДЛЯ ДЕСКТОПА */}
                                    <div className="absolute inset-y-0 left-4 items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:flex">
                                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                            <ChevronLeft className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-y-0 right-4 items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:flex">
                                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ПРОГРЕСС-БАР */}
                            {images.length > 1 && (
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 z-20 backdrop-blur-sm">
                                    <motion.div
                                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${progressPercentage}%`,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeOut',
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* РЕЖИМ: 3D (Заглушка для Canvas) */}
                    {activeMode === '3d' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white z-10">
                            <div className="text-center">
                                <Box className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                                <p className="font-jane uppercase tracking-widest text-sm opacity-50">
                                    Canvas 3D Engine Ready
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ  */}
                {hasThreeSixty && (
                    <div className="absolute opacity-90 -bottom-11 left-1/2 -translate-x-1/2 z-20 flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                        <div className="relative flex  p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                            {/* Скользящий индикатор */}
                            <motion.div
                                className="absolute top-1 bottom-1 rounded-full bg-white shadow-md"
                                layoutId="mode-indicator"
                                style={{
                                    left: activeMode === 'photo' ? 4 : '50%',
                                    width: 'calc(50% - 4px)',
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 35,
                                }}
                            />

                            <button
                                onClick={() => setActiveMode('photo')}
                                className={cn(
                                    'relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 font-jane',
                                    activeMode === 'photo'
                                        ? 'text-black'
                                        : 'text-white/70 hover:text-white'
                                )}
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span>Photo</span>
                            </button>

                            <button
                                onClick={() => setActiveMode('3d')}
                                className={cn(
                                    'relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 font-jane',
                                    activeMode === '3d'
                                        ? 'text-black'
                                        : 'text-white/70 hover:text-white'
                                )}
                            >
                                <Box className="w-4 h-4" />
                                <span>360°</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
