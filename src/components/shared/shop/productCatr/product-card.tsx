'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { ProductCardProps } from '@/types/product';
import { CardImagesComponent } from './ card-images-compoment';
import { Bage } from './bage';
import { CardContentComponent } from './card-content-component';
import { CardFooterComponent } from './card-footer-component';

// ВАЖНО: Обнови свой интерфейс в src/types/product.ts
// Добавь туда: category?: { name: string };

export function ProductCard({ product, priority = false }: ProductCardProps) {
    console.log({ product });
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const isAvailable = product.status == 'AVAILABLE';

    // const formattedPrice = (product.price / 100).toLocaleString('it-IT', {
    //     style: 'currency',
    //     currency: 'EUR',
    // });

    // Защита от Stale Closures через callback-функцию в setState
    const toggleSide = (e: React.MouseEvent) => {
        e.preventDefault(); // Предотвращаем переход по ссылке при клике на стрелки
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
                <Bage isAvailable={isAvailable} status={product.status} />

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
            <div className="bg-amber-500 rounded-xl pt-5 -mt-5 shadow-md shadow-black/30 relative ">
                <CardContentComponent
                    product={product}
                    // formattedPrice={formattedPrice}
                    formattedPrice={product.price.toString().slice(0, 3) + ' €'}
                    toggleSide={toggleSide}
                />

                <CardFooterComponent isAvailable={isAvailable} />
            </div>
        </Card>
    );
}
