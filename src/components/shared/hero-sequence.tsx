'use client';

import { CanvasViewer } from '@/components/shared/canvas/canvas-viewer';
import { useCanvasSequence } from '@/hooks/use-canvas-sequence';
import {
    DeviceBreakpoint,
    getStoragePublicUrl,
    StorageFolder,
} from '@/lib/supabase-paths';
import { useCallback } from 'react';

interface HeroSequenceProps {
    folderName: StorageFolder;
    frameCount: number;
}

export const HeroSequence = ({ folderName, frameCount }: HeroSequenceProps) => {
    // 1. Настраиваем получение URL кадров
    const getFrameUrl = useCallback(
        (index: number, breakpoint: DeviceBreakpoint) => {
            const paddedIndex = String(index + 1).padStart(3, '0');
            const fileName = `${paddedIndex}.webp`;
            return getStoragePublicUrl(folderName, breakpoint, fileName);
        },
        [folderName]
    );

    // 2.  хук в режиме СКРОЛЛА
    const { canvasRef, trackRef, isLoaded, loadingProgress } =
        useCanvasSequence({
            frameCount,
            getFrameUrl,
            mode: 'scroll',
        });

    return (
        // trackRef привязан к контейнеру 400vh
        <section ref={trackRef} className="relative w-full h-[400vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
                {/* Логотип  */}
                <div className="absolute top-4 md:top-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <span className="text-2xl font-black tracking-widest text-zinc-800 uppercase text-shadow-lg/30 font-jane">
                        Jane Art
                    </span>
                </div>

                {/* КАНВАС */}
                <CanvasViewer
                    canvasRef={canvasRef}
                    isLoaded={isLoaded}
                    loadingProgress={loadingProgress}
                />

                {/* Лозунг */}
                <div
                    className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 delay-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <h1 className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 text-2xl md:text-4xl lg:text-6xl text-center text-zinc-500 tracking-widest text-shadow-lg/30 font-jane">
                        Arte da indossare
                    </h1>
                </div>
            </div>
        </section>
    );
};
