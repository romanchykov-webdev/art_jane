import { useCallback, useEffect, useRef, useState } from 'react';

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
    const trackRef = useRef<HTMLElement | null>(null); // Реф для обертки, отслеживающей скролл
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const requestRef = useRef<number>(0); //  ID кадра для отмены

    const [isLoaded, setIsLoaded] = useState(false);
    const [currentBreakpoint, setCurrentBreakpoint] =
        useState<DeviceBreakpoint>('desktop');

    // 1. БЕЗОПАСНАЯ ПРЕДЗАГРУЗКА
    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;
        const actualBreakpoint = getDeviceBreakpoint(window.innerWidth);

        // Массив для хранения ссылок на созданные объекты Image
        const loadingImages: HTMLImageElement[] = [];

        const preloadImages = async () => {
            const promises = Array.from({ length: frameCount }).map(
                (_, index) => {
                    return new Promise<HTMLImageElement>((resolve, reject) => {
                        if (signal.aborted)
                            return reject(
                                new DOMException('Aborted', 'AbortError')
                            );

                        const img = new Image();
                        loadingImages.push(img); // Сохраняем ссылку для возможной отмены

                        img.onload = () => resolve(img);
                        img.onerror = () => {
                            img.src = ''; // Принудительно отменяем зависший запрос
                            reject(new Error(`Failed to load frame ${index}`));
                        };

                        // Присваиваем src только после навешивания обработчиков
                        img.src = getFrameUrl(index, actualBreakpoint);
                    });
                }
            );

            // Используем allSettled: ждем завершения всех запросов, даже если часть упадет с 404
            const results = await Promise.allSettled(promises);

            if (!signal.aborted) {
                // Фильтруем только успешно загруженные картинки
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
                    setIsLoaded(true);
                } else {
                    console.error(
                        '[CanvasSequence] Critical Error: 0 frames loaded.'
                    );
                }
            }
        };

        preloadImages();

        return () => {
            abortController.abort();
            // Жесткая отмена браузерных загрузок для каждого созданного элемента
            loadingImages.forEach(img => {
                img.src = '';
            });
            imagesRef.current = [];
        };
    }, [frameCount, getFrameUrl]);

    // 2. ДВИЖОК ОТРИСОВКИ (Математика object-fit: cover)
    const renderFrame = useCallback((index: number) => {
        if (!canvasRef.current || imagesRef.current.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imagesRef.current[index];
        if (!img) return;

        // Очищаем предыдущий кадр
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Расчет пропорций, чтобы обьект всегда была по центру и заполняла экран
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

    // 3. СИНХРОНИЗАЦИЯ СО СКРОЛЛОМ (Race Conditions Protection для анимации)
    const handleScroll = useCallback(() => {
        if (!trackRef.current || !isLoaded) return;

        // Получаем позицию трека относительно окна
        const { top, height } = trackRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Считаем прогресс (от 0 до 1)
        const maxScroll = height - windowHeight;
        let progress = -top / maxScroll;
        progress = Math.max(0, Math.min(1, progress)); // Строго ограничиваем

        // Вычисляем индекс кадра
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(progress * frameCount)
        );

        // Отменяем предыдущий запрос на отрисовку (защита от "дрожания" кадров при быстром скролле)
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(() =>
            renderFrame(frameIndex)
        );
    }, [frameCount, isLoaded, renderFrame]);

    // 4. ПОДПИСКА НА СОБЫТИЯ
    useEffect(() => {
        if (!isLoaded) return;

        const resizeCanvas = () => {
            if (canvasRef.current) {
                // Жестко привязываем размер внутреннего буфера канваса к реальным пикселям экрана
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                handleScroll(); // Перерисовываем кадр после ресайза
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', handleScroll, { passive: true });

        resizeCanvas(); // Первичная настройка размеров при монтировании

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isLoaded, handleScroll]);

    return {
        canvasRef,
        trackRef,
        isLoaded,
        currentBreakpoint,
    };
};
// @components/canvas/ProductSequence.tsx
