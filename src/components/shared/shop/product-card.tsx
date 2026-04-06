// src/components/shared/shop/product-card.tsx
'use client';

import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProductCardProps } from '@/types/product';

// ВАЖНО: Обнови свой интерфейс в src/types/product.ts
// Добавь туда: category?: { name: string };

export function ProductCard({ product, priority = false }: ProductCardProps) {
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const isAvailable = product.status === 'AVAILABLE';

    const formattedPrice = (product.price / 100).toLocaleString('it-IT', {
        style: 'currency',
        currency: 'EUR',
    });

    // Защита от Stale Closures через callback-функцию в setState
    const toggleSide = (e: React.MouseEvent) => {
        e.preventDefault(); // Предотвращаем переход по ссылке при клике на стрелки
        setActiveSide(prev => (prev === 'front' ? 'back' : 'front'));
    };

    return (
        <Card className="group  border-none bg-transparent transition-all duration-500 flex flex-col  py-0 shadow-md shadow-black/30  hover:shadow-lg">
            <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-muted"
            >
                {/* СТАТУС БЕЙДЖ */}
                {!isAvailable && (
                    <Badge
                        variant="destructive"
                        className="absolute left-3 top-3 z-10 uppercase"
                    >
                        {product.status.replace('_', ' ')}
                    </Badge>
                )}

                {/* ИЗОБРАЖЕНИЯ (Слайдер) */}
                <div
                    className={cn(
                        'relative h-full w-full',
                        !isAvailable && 'grayscale brightness-75'
                    )}
                >
                    <Image
                        src={product.thumbnailFront}
                        alt={product.title}
                        priority={priority}
                        fill
                        className={cn(
                            'object-cover transition-opacity duration-500',
                            activeSide === 'front' ? 'opacity-100' : 'opacity-0'
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <Image
                        src={product.thumbnailBack}
                        alt={`${product.title} back`}
                        priority={priority}
                        fill
                        className={cn(
                            'object-cover transition-opacity duration-500 absolute inset-0',
                            activeSide === 'back' ? 'opacity-100' : 'opacity-0'
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                {/* СТРЕЛКИ СЛАЙДЕРА (Появляются при наведении на десктопе, всегда доступны по клику) */}
                <div className="absolute bottom-0 w-full flex items-center justify-between px-2  transition-opacity duration-300 ">
                    <Button
                        variant="secondary"
                        // size="icon"
                        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-70"
                        onClick={toggleSide}
                    >
                        <ChevronLeft className="size-10" />
                    </Button>
                    <Button
                        variant="secondary"
                        // size="icon"
                        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-70"
                        onClick={toggleSide}
                    >
                        <ChevronRight className="size-10" />
                    </Button>
                </div>
            </Link>

            <CardContent className="mt-4 p-0 flex-grow">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                        {/* КАТЕГОРИЯ */}
                        {product.category?.name && (
                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1">
                                {product.category.name}
                            </span>
                        )}
                        <h3 className="text-sm font-medium leading-none tracking-tight uppercase">
                            {product.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground uppercase">
                            Size: {product.size}
                        </p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">
                        {formattedPrice}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="mt-5 p-0 flex gap-2">
                <Button
                    className="flex-1 gap-2 rounded-lg py-6 uppercase tracking-widest text-xs transition-transform active:scale-[0.98]"
                    disabled={!isAvailable}
                >
                    <ShoppingBag className="h-4 w-4" />
                    {isAvailable ? 'Add to cart' : 'Sold Out'}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-auto w-14 rounded-lg transition-colors hover:text-red-500 hover:border-red-500 active:scale-[0.98]"
                >
                    <Heart className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
