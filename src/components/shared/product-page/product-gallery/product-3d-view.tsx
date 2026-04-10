'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { CanvasViewer } from '@/components/shared/canvas/canvas-viewer';
import { useCanvasSequence } from '@/hooks/use-canvas-sequence';
import {
    DeviceBreakpoint,
    getStoragePublicUrl,
    StorageFolder,
} from '@/lib/supabase-paths';

interface Product3DViewProps {
    folderName: StorageFolder;
    frameCount: number;
    isActive: boolean;
}

// ВРЕМЕННЫЙ ФЛАГ ДЛЯ ТЕСТОВ (Потом можно вынести в интерфейс пропсов)
const IS_CYCLIC = false; //  true для бесконечного круга, false для жестких границ

export function Product3DView({
    folderName,
    frameCount,
    isActive,
}: Product3DViewProps) {
    // 1. Получаем URL кадров
    const getFrameUrl = useCallback(
        (index: number, breakpoint: DeviceBreakpoint) => {
            const paddedIndex = String(index + 1).padStart(3, '0');
            const fileName = `${paddedIndex}.webp`;
            return getStoragePublicUrl(folderName, breakpoint, fileName);
        },
        [folderName]
    );

    // 2. Инициализируем хук в режиме 'controlled' (ручное управление)
    const { canvasRef, isLoaded, loadingProgress, setFrame, hasError, retry } =
        useCanvasSequence({
            frameCount,
            getFrameUrl,
            mode: 'controlled',
        });

    // 3. Стейты для физики вращения
    const [showHint, setShowHint] = useState(true);
    const currentFrame = useRef(0);
    const isDragging = useRef(false);
    const startX = useRef(0);

    // 4. Логика перетаскивания (Drag)
    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        setShowHint(false);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current || !isLoaded || !setFrame) return;

        const deltaX = e.clientX - startX.current;
        const sensitivity = 5;

        if (Math.abs(deltaX) > sensitivity) {
            const direction = deltaX > 0 ? 1 : -1;

            if (IS_CYCLIC) {
                // Цикличное вращение (0 -> 174 -> 0)
                currentFrame.current =
                    (currentFrame.current + direction + frameCount) %
                    frameCount;
            } else {
                // Ограниченное вращение (упирается в 0 и в frameCount - 1)
                currentFrame.current = Math.max(
                    0,
                    Math.min(frameCount - 1, currentFrame.current + direction)
                );
            }

            setFrame(currentFrame.current);
            startX.current = e.clientX;
        }
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    return (
        // touch-none предотвращает скролл страницы на мобилках при свайпе модели
        <div
            className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none bg-zinc-950"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={
                handlePointerUp
            } /* ФИКС: Защита от системных прерываний (звонки, свайпы ОС) */
        >
            <CanvasViewer
                canvasRef={canvasRef}
                isLoaded={isLoaded}
                loadingProgress={loadingProgress}
                hasError={hasError}
                onRetry={retry}
            />

            {/* Онбординг для пользователя */}
            <AnimatePresence>
                {isLoaded && showHint && isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-none"
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
                                Drag to Rotate
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
