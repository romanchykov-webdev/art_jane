'use client';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { useHasMounted } from '@/hooks/use-has-mounted';
import { useShopStore } from '@/store/use-shop-store';
import { ProductCardData, StoreProduct } from '@/types/product';

interface Props {
    product: ProductCardData;
    isAvailable: boolean;
}

export function CardFooterComponent({ product, isAvailable }: Props) {
    const cart = useShopStore(state => state.cart);
    const toggleCart = useShopStore(state => state.toggleCart);

    const favorites = useShopStore(state => state.favorites);
    const toggleFavorite = useShopStore(state => state.toggleFavorite);

    const isMounted = useHasMounted();

    // Преобразуем product в StoreProduct
    const storeProduct: StoreProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnailFront: product.thumbnailFront,
        size: product.size,
    };

    const isFavorite = isMounted
        ? favorites.some(item => item?.id === storeProduct.id)
        : false;
    const isInCart = isMounted
        ? cart.some(item => item?.id === storeProduct.id)
        : false;

    const handleToggleCart = () => {
        if (!isAvailable) return;
        toggleCart(storeProduct);
        if (isInCart) {
            toast.error('Удалено из корзины');
        } else {
            toast.success(`${product.title} добавлена в корзину`, {
                className: 'bg-emerald-500 text-white border-none',
            });
        }
    };

    const handleToggleFavorite = () => {
        toggleFavorite(storeProduct);
        if (isFavorite) {
            toast.error('Удалено из избранного');
        } else {
            toast.success('Добавлено в избранное', {
                className: 'bg-emerald-500 text-white border-none',
            });
        }
    };

    return (
        <CardFooter className="p-0 flex font-jane">
            <Button
                variant="destructive"
                onClick={handleToggleCart}
                disabled={!isAvailable}
                className="flex-1 gap-2 rounded-none py-6 uppercase tracking-widest cursor-pointer
                        text-xs transition-all duration-300 active:scale-[0.98] border-none text-black font-jane group"
            >
                {isAvailable ? (
                    <ShoppingCart
                        className={`size-10 transition-colors duration-300 ${
                            isInCart
                                ? 'text-black fill-black'
                                : 'text-black fill-transparent group-hover:fill-black/20'
                        }`}
                    />
                ) : (
                    ''
                )}
                {isAvailable ? '' : 'Sold Out'}
            </Button>

            <div className="w-1 h-12 bg-black/30"></div>

            <Button
                variant="destructive"
                size="icon"
                onClick={handleToggleFavorite}
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
