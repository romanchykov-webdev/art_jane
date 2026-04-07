import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    return (
        <div
            className={cn(
                'relative h-full w-full'
                // !isAvailable && 'grayscale brightness-75'
            )}
        >
            <Image
                src={thumbnailFront}
                alt={title}
                priority={priority}
                fill
                className={cn(
                    'object-cover transition-opacity duration-500',
                    activeSide === 'front' ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Image
                src={thumbnailBack}
                alt={`${title} back`}
                priority={priority}
                fill
                className={cn(
                    'object-cover transition-opacity duration-500 absolute inset-0',
                    activeSide === 'back' ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
}
