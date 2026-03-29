'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useCanvasSequence } from '@/hooks/use-canvas-sequence';
import {
    DeviceBreakpoint,
    getStoragePublicUrl,
    StorageFolder,
} from '@/lib/supabase-paths';
import { useCallback } from 'react';

interface ProductSequenceProps {
    folderName: StorageFolder;
    frameCount: number;
}

export const ProductSequence = ({
    folderName,
    frameCount,
}: ProductSequenceProps) => {
    const getFrameUrl = useCallback(
        (index: number, breakpoint: DeviceBreakpoint) => {
            const paddedIndex = String(index + 1).padStart(3, '0');
            const fileName = `${paddedIndex}.webp`;

            return getStoragePublicUrl(folderName, breakpoint, fileName);
        },
        [folderName]
    );

    const { canvasRef, trackRef, isLoaded } = useCanvasSequence({
        frameCount,
        getFrameUrl,
    });

    return (
        <section ref={trackRef} className="relative w-full h-[400vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-md">
                        <div className="flex flex-col items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <p className="text-sm font-medium tracking-wide text-muted-foreground animate-pulse">
                                Подготовка текстур...
                            </p>
                        </div>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    className="block w-full h-full object-cover"
                    aria-label="Интерактивная модель одежды"
                />

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter text-white drop-shadow-xl opacity-90 mix-blend-difference text-center leading-tight">
                        Искусство, которое <br /> можно носить
                    </h1>
                </div>
            </div>
        </section>
    );
};
