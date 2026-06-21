'use client';

import { Button } from '@/components/ui/button';
import { useProductActions } from '@/hooks/use-product-actions';
import { cn } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import React from 'react';

interface AddToCartButtonProps extends Omit<
    React.ComponentProps<typeof Button>,
    'onClick' | 'children'
> {
    product: StoreProduct;
    isInsideLink?: boolean | undefined;
    onToggleCart?: ((next: { isInCart: boolean }) => void) | undefined;
}

export function AddToCartButton({
    product,
    isInsideLink,
    onToggleCart,
    className,
    variant,
    size = 'sm',
    ...props
}: AddToCartButtonProps) {
    const { isInCart, isAvailable, statusLabel, toggleCart } =
        useProductActions(product, {
            isInsideLink,
            onToggleCart,
        });

    if (!isAvailable) {
        return (
            <Button
                size={size}
                variant="outline"
                aria-disabled="true"
                className={cn(
                    'rounded-full font-jane text-xs tracking-wider transition-colors h-8 px-4',
                    'bg-white/20 text-white opacity-50 cursor-not-allowed ',
                    className
                )}
                {...props}
            >
                {statusLabel}
            </Button>
        );
    }

    return (
        <Button
            size={size}
            onClick={toggleCart}
            aria-pressed={isInCart}
            aria-label={`${isInCart ? 'Remove' : 'Add'} ${product.title} ${isInCart ? 'from' : 'to'} cart`}
            variant={variant ?? (isInCart ? 'secondary' : 'default')}
            className={cn(
                'rounded-full font-jane text-xs bg-gray-300 tracking-wider transition',
                ' duration-500 h-8 px-4 shadow-even-sm cursor-pointer hover:shadow-even-md',
                isInCart
                    ? ' text-red-500 hover:bg-rose-500 hover:text-white border-2 border-red-500'
                    : ' text-black   hover:bg-gray-200',
                className
            )}
            {...props}
        >
            {isInCart ? 'REMOVE' : 'ADD TO CART'}
        </Button>
    );
}
