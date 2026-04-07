import { Badge } from '@/components/ui/badge';
import { ProductStatus } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface Props {
    isAvailable: boolean;
    classBage?: string;
    status: ProductStatus;
}

export const ProductStatusBadge: React.FC<Props> = ({
    isAvailable,
    classBage,
    status,
}): JSX.Element => {
    return (
        <>
            {!isAvailable && (
                <Badge
                    variant="destructive"
                    className={cn(
                        // Базовые стили и позиционирование
                        'absolute left-0 top-0 z-10 flex items-center justify-center uppercase text-white text-shadow-sm',
                        'min-w-10 h-10 rounded-none rounded-br-lg px-6 font-jane',
                        // Эффект матового стекла
                        'bg-amber-500/60 backdrop-blur-md',
                        // Стеклянный блик (highlight)
                        'border-b border-r border-amber-300/40',
                        // Мягкая тень для отрыва от картинки
                        'shadow-md shadow-black/30',
                        classBage
                    )}
                >
                    {status.replace('_', ' ')}
                </Badge>
            )}
        </>
    );
};
