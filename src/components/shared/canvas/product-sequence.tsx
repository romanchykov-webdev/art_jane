'use client';

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

    // Достаем наш новый стейт
    const { canvasRef, trackRef, isLoaded, loadingProgress } =
        useCanvasSequence({
            frameCount,
            getFrameUrl,
        });

    // Математика для заполнения SVG круга
    const circleRadius = 40;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset =
        circleCircumference - (loadingProgress / 100) * circleCircumference;

    return (
        <section ref={trackRef} className="relative w-full h-[400vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
                {/* Логотип всегда сверху */}
                <div className="absolute top-4 md:top-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <span className="text-2xl font-black tracking-widest text-grey-500 uppercase text-shadow-lg/30 font-jane">
                        Jane Art
                    </span>
                </div>

                {/* лоадер-оверлей */}
                <div
                    className={`absolute inset-0 z-10 bg-zinc-950 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
                        isLoaded
                            ? 'opacity-0 pointer-events-none'
                            : 'opacity-100'
                    }`}
                >
                    <div className="relative flex items-center justify-center w-32 h-32">
                        {/* Фоновое кольцо */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r={circleRadius}
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="transparent"
                                className="text-zinc-800"
                            />
                            {/* Кольцо прогресса */}
                            <circle
                                cx="64"
                                cy="64"
                                r={circleRadius}
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="transparent"
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={strokeDashoffset}
                                className="text-white transition-all duration-200 ease-out"
                            />
                        </svg>
                        {/* Цифры в центре */}
                        <span className="text-xl font-bold tracking-tighter text-white">
                            {loadingProgress}%
                        </span>
                    </div>
                    <p className="mt-4 text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
                        Подготовка текстур
                    </p>
                </div>

                {/* Интерактивный Канвас */}
                <canvas
                    ref={canvasRef}
                    className={`block w-full h-full object-cover transition-opacity duration-1000 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-label="Интерактивная модель одежды"
                />

                {/* Лозунг поверх загруженного канваса */}
                <div
                    className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 delay-300  ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Лозунг поверх загруженного канваса */}
                    <h1 className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 text-2xl md:text-4xl lg:text-6xl text-center text-grey-100 tracking-widest text-shadow-lg/30 font-jane">
                        Arte da indossare
                    </h1>
                </div>
            </div>
        </section>
    );
};
