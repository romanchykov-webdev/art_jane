'use client';

import { useShopStore } from '@/components/shop-store-provider';
import { ProductStatus } from '@/generated/prisma';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { formatPrice } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { ActionIconButton } from './action-icon-button';
export interface ProductInfoData {
    id: string;
    title: string;
    slug: string;
    thumbnailFront: string;
    price: number;
    description: string | null;
    size: string;
    status: ProductStatus;
    category?: {
        name: string;
    } | null;
}

interface ProductInfoProps {
    product: ProductInfoData;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const isAvailable = product.status === 'AVAILABLE';

    const cart = useShopStore(state => state.cart);
    const toggleCart = useShopStore(state => state.toggleCart);
    const favorites = useShopStore(state => state.favorites);
    const toggleFavorite = useShopStore(state => state.toggleFavorite);
    const isMounted = useHasMounted();
    const storeProduct: StoreProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnailFront: product.thumbnailFront,
        size: product.size,
        slug: product.slug,
        status: product.status,
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
        <div className="flex flex-col pt-4">
            {/* КАТЕГОРИЯ */}
            {product.category && (
                <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                    {product.category.name}
                </span>
            )}

            {/* НАЗВАНИЕ */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase font-jane mb-6">
                {product.title}
            </h1>

            {/* ЦЕНА */}
            <div className="text-3xl font-bold mb-8">
                {formatPrice(product.price)}
            </div>

            {/* ОПИСАНИЕ */}
            {product.description ? (
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                    {product.description}
                </p>
            ) : (
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed italic">
                    Description is temporarily unavailable.
                </p>
            )}

            {/* ХАРАКТЕРИСТИКИ */}
            <div className="border-t border-border py-6 mb-8">
                <div className="flex justify-between items-center uppercase tracking-wider text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-bold text-lg">{product.size}</span>
                </div>
            </div>

            <div className="flex items-center rounded-lg overflow-hidden shadow-even-lg">
                <ActionIconButton
                    icon={ShoppingCart}
                    active={isInCart}
                    onClick={handleToggleCart}
                    disabled={!isAvailable}
                />

                <div className="w-1 h-12 bg-black/30" />

                <ActionIconButton
                    icon={Heart}
                    active={isFavorite}
                    onClick={handleToggleFavorite}
                />
            </div>
        </div>
    );
}
