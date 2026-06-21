'use client';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { useProductActions } from '@/hooks/use-product-actions';
import { ProductCardData, StoreProduct } from '@/types/product';

interface Props {
    product: ProductCardData;
}

export function CardFooterComponent({ product }: Props) {
    // 1. Хук строго ждет StoreProduct
    const storeProduct: StoreProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnailFront: product.thumbnailFront,
        size: product.size,
        slug: product.slug,
        status: product.status,
    };

    // 2.  хук . Тосты живут в колбэках хука!
    const { isInCart, isFavorite, isAvailable, toggleCart, toggleFavorite } =
        useProductActions(storeProduct, {
            // Используем next.isInCart, чтобы избежать чтения старого стейта при дабл-кликах
            onToggleCart: next => {
                if (next.isInCart) {
                    toast.success(`${product.title} добавлена в корзину`, {
                        className: 'bg-emerald-500 text-white border-none',
                    });
                } else {
                    toast.error('Удалено из корзины');
                }
            },
            onToggleFavorite: next => {
                if (next.isFavorite) {
                    toast.success('Добавлено в избранное', {
                        className: 'bg-emerald-500 text-white border-none',
                    });
                } else {
                    toast.error('Удалено из избранного');
                }
            },
        });

    return (
        <CardFooter className="p-0 flex font-jane">
            <Button
                variant="destructive"
                onClick={toggleCart}
                aria-disabled={!isAvailable}
                aria-pressed={isInCart}
                className="flex-1 gap-2 rounded-none py-6 uppercase tracking-widest cursor-pointer
                        text-xs transition-all duration-300 active:scale-[0.98] border-none text-black font-jane group"
            >
                {isAvailable && (
                    <ShoppingCart
                        className={`size-10 transition-colors duration-300 ${
                            isInCart
                                ? 'text-black fill-black'
                                : 'text-black fill-transparent group-hover:fill-black/20'
                        }`}
                    />
                )}
                {isAvailable ? '' : 'Sold Out'}
            </Button>

            <div className="w-1 h-12 bg-black/30"></div>

            <Button
                variant="destructive"
                size="icon"
                onClick={toggleFavorite}
                aria-pressed={isFavorite}
                className="flex-1 gap-2 rounded-none py-6 uppercase tracking-widest text-xs cursor-pointer
                        transition-all duration-300 active:scale-[0.98] border-none group"
            >
                <Heart
                    className={`size-10 transition-colors duration-300 ${
                        isFavorite
                            ? 'text-black fill-black'
                            : 'text-black fill-transparent group-hover:fill-black/20'
                    }`}
                />
            </Button>
        </CardFooter>
    );
}
