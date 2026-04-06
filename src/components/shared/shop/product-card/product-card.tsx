'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { ProductCardProps } from '@/types/product';

import { formatPrice } from '@/lib/utils';
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
            className="group  border-none bg-gray-200 transition-all duration-500 flex flex-col
          py-0 shadow-md shadow-black/30  hover:shadow-lg gap-0"
        >
            <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-3/4 overflow-hidden  bg-muted"
            >
                {/* СТАТУС БЕЙДЖ */}
                <ProductStatusBadge
                    isAvailable={isAvailable}
                    status={product.status}
                />

                {/* ИЗОБРАЖЕНИЯ (Слайдер) */}
                <CardImagesComponent
                    thumbnailFront={product.thumbnailFront}
                    thumbnailBack={product.thumbnailBack}
                    isAvailable={isAvailable}
                    title={product.title}
                    priority={priority}
                    activeSide={activeSide}
                />
            </Link>

            {/* content  */}
            <div className=" rounded-xl pt-5 -mt-1 shadow-md shadow-black/30 relative bg-gray-300">
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
