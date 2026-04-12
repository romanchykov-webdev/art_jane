import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
    thumbnailFront: string;
    thumbnailBack: string;
    isAvailable: boolean;
    title: string;
    priority: boolean;
    activeSide: 'front' | 'back';
}

export function CardImagesComponent({
    thumbnailFront,
    thumbnailBack,
    isAvailable,
    title,
    priority,
    activeSide,
}: Props) {
    // Независимые стейты загрузки для каждой стороны
    const [isFrontLoaded, setIsFrontLoaded] = useState(false);
    const [isBackLoaded, setIsBackLoaded] = useState(false);
    return (
        <div
            className={cn(
                'relative h-full w-full',
                !isAvailable && 'opacity-95'
            )}
        >
            {/* LOADER ДЛЯ ПЕРЕДНЕЙ СТОРОНЫ */}
            {activeSide === 'front' && !isFrontLoaded && (
                <Skeleton className="absolute inset-0 h-full w-full  bg-gray-300 flex items-center justify-center">
                    <Loader2 className="mr-2 h-24 w-24 animate-spin text-amber-500" />
                </Skeleton>
            )}

            {/* LOADER ДЛЯ ЗАДНЕЙ СТОРОНЫ */}
            {activeSide === 'back' && !isBackLoaded && (
                <Skeleton className="absolute inset-0 h-full w-full  bg-gray-300 flex items-center justify-center">
                    <Loader2 className="mr-2 h-24 w-24 animate-spin text-amber-500" />
                </Skeleton>
            )}
            {/* ПЕРЕДНЕЕ ИЗОБРАЖЕНИЕ */}
            <Image
                src={thumbnailFront}
                alt={title}
                priority={priority}
                fill
                onLoad={() => setIsFrontLoaded(true)}
                className={cn(
                    'object-cover transition-opacity duration-500 z-10',
                    // Картинка видна ТОЛЬКО если это её сторона И она полностью загрузилась
                    activeSide === 'front' && (isFrontLoaded || priority)
                        ? 'opacity-100'
                        : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* ЗАДНЕЕ ИЗОБРАЖЕНИЕ (Скрыто по умолчанию) */}
            <Image
                src={thumbnailBack}
                alt={`${title} back`}
                priority={priority}
                fill
                onLoad={() => setIsBackLoaded(true)}
                className={cn(
                    'object-cover transition-opacity duration-500 absolute inset-0 z-10',
                    // Картинка видна ТОЛЬКО если это её сторона И она полностью загрузилась
                    activeSide === 'back' && (isBackLoaded || priority)
                        ? 'opacity-100'
                        : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
}
