'use client';

import { SheetItemCard } from '@/components/shared/sheets/sheet-item-card';
import { StoreProduct } from '@/types/product';
import { AddToCartButton } from '../cart/add-to-cart-button';

interface ProfileItemCardProps {
    item: StoreProduct;
    type: 'favorite' | 'cart';

    onRemove: () => void;
}

export function ProfileItemCard({
    item,
    type,
    onRemove,
}: ProfileItemCardProps) {
    return (
        <SheetItemCard
            item={item}
            onRemove={onRemove}
            type={type}
            actionSlot={
                type === 'favorite' ? (
                    <AddToCartButton product={item} />
                ) : undefined
            }
        />
    );
}
