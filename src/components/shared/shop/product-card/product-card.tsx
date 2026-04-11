'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { ProductCardProps } from '@/types/product';

import { CardContentComponent } from './card-content-component';
import { CardFooterComponent } from './card-footer-component';
import { CardImagesComponent } from './card-images-compoment';
import { ProductStatusBadge } from './product-status-badge';

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const isAvailable = product.status === 'AVAILABLE';

    const toggleSide = () => {
        setActiveSide(prev => (prev === 'front' ? 'back' : 'front'));
    };

    return (
        <Card
            // 1. ОБЕРТКА:
            className="group  bg-white/40 flex flex-col py-0 shadow-even-sm gap-0 hover:shadow-even-md transition-all duration-500  ring-0 overflow-hidden"
        >
            <Link
                href={`/product/${product.slug}`}
                target="_blank"
                // 2. ИЗОБРАЖЕНИЕ:
                className="relative block aspect-3/4 overflow-hidden rounded-2xl bg-muted/50 transition-transform duration-500 group-hover:scale-[1.02]"
            >
                {/* СТАТУС БЕЙДЖ */}
                <ProductStatusBadge
                    isAvailable={isAvailable}
                    status={product.status}
                />

                {/* ИЗОБРАЖЕНИЯ */}
                <CardImagesComponent
                    thumbnailFront={product.thumbnailFront}
                    thumbnailBack={product.thumbnailBack}
                    isAvailable={isAvailable}
                    title={product.title}
                    priority={priority}
                    activeSide={activeSide}
                />
            </Link>

            {/* 3. КОНТЕНТ (Стеклянный подиум) */}
            <div
                className={cn(
                    'relative z-10 -mt-5 pt-2',
                    'rounded-xl overflow-hidden',
                    'bg-white/40',
                    'backdrop-blur-md',
                    'border border-white/50 dark:border-white/10',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]',
                    'dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
                    'transition-transform duration-500'
                )}
            >
                <CardContentComponent
                    product={product}
                    formattedPrice={formatPrice(product.price)}
                    toggleSide={toggleSide}
                />

                <CardFooterComponent isAvailable={isAvailable} />
            </div>
        </Card>
    );
}
