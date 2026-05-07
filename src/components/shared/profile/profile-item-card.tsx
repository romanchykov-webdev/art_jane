'use client';

import { SheetItemCard } from '@/components/shared/sheets/sheet-item-card';
import { useShopStore } from '@/store/use-shop-store';
import { StoreProduct } from '@/types/product';

interface ProfileItemCardProps {
    item: StoreProduct;
    type: 'favorite' | 'cart';
}

export function ProfileItemCard({ item, type }: ProfileItemCardProps) {
    const { removeFromCart, toggleFavorite } = useShopStore();

    const handleRemove = () => {
        if (type === 'favorite') {
            toggleFavorite(item);
        } else {
            removeFromCart(item.id, item.size || '');
        }
    };

    return <SheetItemCard item={item} onRemove={handleRemove} type={type}/>;
}
