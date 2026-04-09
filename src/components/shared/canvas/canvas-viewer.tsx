'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { RefObject } from 'react';

interface CanvasViewerProps {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isLoaded: boolean;
    loadingProgress: number;
    className?: string;
}

export function CanvasViewer({
    canvasRef,
    isLoaded,
    loadingProgress,
    className = '',
}: CanvasViewerProps) {
    const circleRadius = 40;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset =
        circleCircumference - (loadingProgress / 100) * circleCircumference;

    return (
        <div
            className={`relative w-full h-full overflow-hidden bg-zinc-950 ${className}`}
        >
            {/* ЛОАДЕР  */}
            <div
                className={`absolute inset-0 z-10 transition-opacity duration-700 ease-in-out ${
                    isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                <Skeleton className="w-full h-full rounded-none bg-zinc-900 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center w-48 h-48">
                            <svg
                                viewBox="0 0 128 128"
                                className="absolute w-full h-full transform -rotate-90"
                            >
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={circleRadius}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-zinc-800"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={circleRadius}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="text-amber-500 transition-all duration-200 ease-out"
                                />
                            </svg>
                            <span className="text-4xl font-bold tracking-tighter text-white">
                                {loadingProgress}%
                            </span>
                        </div>
                        <p className="mt-4 text-md font-bold tracking-[0.2em] text-zinc-500 uppercase font-jane">
                            Loading 3D...
                        </p>
                    </div>
                </Skeleton>
            </div>

            {/* САМ КАНВАС */}
            <canvas
                ref={canvasRef}
                className={`block w-full h-full object-cover transition-opacity duration-1000 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                aria-label="3D Interactive View"
            />
        </div>
    );
}
