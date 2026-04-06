import { DeviceBreakpoint } from '@/lib/supabase-paths';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const trackRef = useRef<HTMLElement | null>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const requestRef = useRef<number>(0);

    const isLoadedRef = useRef(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentBreakpoint, setCurrentBreakpoint] =
        useState<DeviceBreakpoint>('desktop');

    const geometryRef = useRef({ offsetTop: 0, height: 0 });

    const updateGeometry = useCallback(() => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        // Вычисляем абсолютную позицию элемента на странице один раз
        geometryRef.current = {
            offsetTop: window.scrollY + rect.top,
            height: rect.height,
        };
    }, []);

    // 1. БЕЗОПАСНАЯ ПРЕДЗАГРУЗКА
    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;
        const actualBreakpoint = getDeviceBreakpoint(window.innerWidth);

        const loadingImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        const preloadImages = async () => {
            if (frameCount === 0) {
                console.error(
                    '[CanvasSequence] Critical Error: frameCount is 0.'
                );
                return;
            }

            const updateProgress = () => {
                loadedCount++;
                setLoadingProgress(
                    Math.round((loadedCount / frameCount) * 100)
                );
            };

            const promises = Array.from({ length: frameCount }).map(
                (_, index) => {
                    return new Promise<HTMLImageElement>((resolve, reject) => {
                        if (signal.aborted) {
                            return reject(
                                new DOMException('Aborted', 'AbortError')
                            );
                        }

                        const img = new Image();
                        loadingImages.push(img);

                        // 1. СЛУШАТЕЛЬ ОТМЕНЫ (ABORT)

                        const onAbort = () => {
                            img.onload = null;
                            img.onerror = null;
                            img.src = '';
                            reject(new DOMException('Aborted', 'AbortError'));
                        };
                        signal.addEventListener('abort', onAbort, {
                            once: true,
                        });

                        img.onload = () => {
                            signal.removeEventListener('abort', onAbort);
                            updateProgress();
                            img.onload = null;
                            img.onerror = null;
                            resolve(img);
                        };

                        img.onerror = () => {
                            signal.removeEventListener('abort', onAbort);
                            updateProgress();
                            img.onload = null;
                            img.onerror = null;
                            img.src = '';
                            reject(new Error(`Failed to load frame ${index}`));
                        };

                        img.src = getFrameUrl(index, actualBreakpoint);
                    });
                }
            );

            const results = await Promise.allSettled(promises);

            if (!signal.aborted) {
                const successfulImages = results
                    .filter(
                        (
                            res
                        ): res is PromiseFulfilledResult<HTMLImageElement> =>
                            res.status === 'fulfilled'
                    )
                    .map(res => res.value);

                if (successfulImages.length > 0) {
                    imagesRef.current = successfulImages;
                    setCurrentBreakpoint(actualBreakpoint);
                    isLoadedRef.current = true; // Синхронно обновляем Ref для скролла
                    setIsLoaded(true); // Обновляем State для React UI
                } else {
                    console.error(
                        '[CanvasSequence] Critical Error: 0 frames loaded. CDN might be down.'
                    );
                }
            }
        };

        preloadImages().catch(err => {
            // Если это ошибка отмены (компонент размонтировался) — просто выходим
            if (err instanceof DOMException && err.name === 'AbortError')
                return;

            // Если что-то другое — логируем, чтобы не пропустить баг
            console.error('[CanvasSequence] Unexpected preload error:', err);
        });

        return () => {
            //  ОЧИСТКА
            abortController.abort();

            imagesRef.current = [];
            isLoadedRef.current = false;
        };
    }, [frameCount, getFrameUrl]);

    // 2. ДВИЖОК ОТРИСОВКИ
    const renderFrame = useCallback((index: number) => {
        if (!canvasRef.current || imagesRef.current.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Защита от выхода за пределы массива при частичной загрузке
        const safeIndex = Math.min(index, imagesRef.current.length - 1);
        const img = imagesRef.current[safeIndex];
        if (!img) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let renderWidth = canvas.width;
        let renderHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
            renderHeight = canvas.width / imgRatio;
            offsetY = (canvas.height - renderHeight) / 2;
        } else {
            renderWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - renderWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    }, []);

    // 3. ВЫСОКОПРОИЗВОДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ СО СКРОЛЛОМ
    const handleScroll = useCallback(() => {
        // Читаем из Ref
        if (!isLoadedRef.current || imagesRef.current.length === 0) return;

        const { offsetTop, height } = geometryRef.current;

        const currentTop = offsetTop - window.scrollY;
        const windowHeight = window.innerHeight;

        const maxScroll = Math.max(1, height - windowHeight);
        let progress = -currentTop / maxScroll;
        progress = Math.max(0, Math.min(1, progress));

        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(progress * frameCount)
        );

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(() =>
            renderFrame(frameIndex)
        );
    }, [frameCount, renderFrame]);

    // 4. ПОДПИСКА НА СОБЫТИЯ
    useEffect(() => {
        if (!isLoaded) return;

        let resizeTimeout: ReturnType<typeof setTimeout>;

        // Единая функция синхронизации размеров
        const syncLayout = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
            updateGeometry();
            handleScroll(); // Заставляем канвас перерисовать текущий кадр в новых пропорциях
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(syncLayout, 150); // Дебаунс ресайза для производительности
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Первичная настройка при монтировании
        syncLayout();

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isLoaded, handleScroll, updateGeometry]);

    return {
        canvasRef,
        trackRef,
        isLoaded,
        loadingProgress,
        currentBreakpoint,
    };
};
