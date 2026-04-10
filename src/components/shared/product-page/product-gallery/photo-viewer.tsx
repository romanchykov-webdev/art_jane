'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PhotoViewerProps {
    images: string[];
    title: string;
}

export function PhotoViewer({ images, title }: PhotoViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showHint, setShowHint] = useState(true);

    const progressPercentage = ((currentIndex + 1) / images.length) * 100;

    const handleNext = () => {
        setShowHint(false);
        setCurrentIndex(prev => (prev + 1 === images.length ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setShowHint(false);
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="absolute inset-0 z-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) handleNext();
                        else if (swipe > swipeConfidenceThreshold) handlePrev();
                    }}
                >
                    <Image
                        src={images[currentIndex] || ''}
                        alt={`${title} - view ${currentIndex + 1}`}
                        fill
                        loading="eager"
                        priority
                        className="object-cover rounded-2xl pointer-events-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </motion.div>
            </AnimatePresence>

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
                                    animate={{ x: [-15, 15, -15] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: 'easeInOut',
                                    }}
                                    className="flex flex-col items-center gap-2 text-white drop-shadow-xl p-4 bg-black/20 backdrop-blur-md rounded-2xl"
                                >
                                    <MoveHorizontal className="w-8 h-8" />
                                    <span className="font-jane uppercase tracking-widest text-xs">
                                        Swipe
                                    </span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ДЕСКТОПНЫЕ ЗОНЫ КЛИКА И СТРЕЛКИ */}
                    <div
                        className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize z-10 hidden md:block"
                        onClick={handlePrev}
                    />
                    <div
                        className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize z-10 hidden md:block"
                        onClick={handleNext}
                    />

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

                    {/* ПРОГРЕСС-БАР */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 z-20 backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
