import { useEffect, useRef, useState } from 'react';

export type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface CanvasSequenceOptions {
    frameCount: number;
    getFrameUrl: (index: number, breakpoint: DeviceBreakpoint) => string;
}

const getDeviceBreakpoint = (width: number): DeviceBreakpoint => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

export const useCanvasSequence = ({
    frameCount,
    getFrameUrl,
}: CanvasSequenceOptions) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);

    const [isLoaded, setIsLoaded] = useState(false);
    // Стартуем с десктопа по умолчанию для SSR, реальный брейкпоинт определим на клиенте
    const [currentBreakpoint, setCurrentBreakpoint] =
        useState<DeviceBreakpoint>('desktop');

    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;

        // Получаем реальный размер экрана безопасно внутри эффекта (на клиенте)
        const actualBreakpoint = getDeviceBreakpoint(window.innerWidth);

        const preloadImages = async () => {
            try {
                const promises = Array.from({ length: frameCount }).map(
                    (_, index) => {
                        return new Promise<HTMLImageElement>(
                            (resolve, reject) => {
                                if (signal.aborted) {
                                    return reject(
                                        new DOMException(
                                            'Aborted',
                                            'AbortError'
                                        )
                                    );
                                }

                                const img = new Image();
                                img.src = getFrameUrl(index, actualBreakpoint);

                                img.onload = () => resolve(img);
                                img.onerror = () =>
                                    reject(
                                        new Error(
                                            `Failed to load frame ${index}`
                                        )
                                    );
                            }
                        );
                    }
                );

                const results = await Promise.all(promises);

                // Асинхронное обновление стейта ПОСЛЕ загрузки
                if (!signal.aborted) {
                    imagesRef.current = results;
                    setCurrentBreakpoint(actualBreakpoint);
                    setIsLoaded(true);
                }
            } catch (error) {
                if ((error as DOMException).name === 'AbortError') {
                    console.warn(
                        '[CanvasSequence] Preload aborted: component unmounted.'
                    );
                } else {
                    console.error(
                        '[CanvasSequence] Error loading frames:',
                        error
                    );
                }
            }
        };

        preloadImages();

        return () => {
            abortController.abort();
            imagesRef.current = [];
        };
    }, [frameCount, getFrameUrl]);

    return {
        canvasRef,
        imagesRef,
        isLoaded,
        currentBreakpoint,
    };
};
