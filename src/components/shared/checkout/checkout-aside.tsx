'use client';
import { useShopStore } from '@/components/shop-store-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import Image from 'next/image';
import React, { JSX, useTransition } from 'react';
import { CheckoutSubmitButton } from './checkout-submit-button';
import { RemoveItemButton } from './remove-button';

interface Props {
    className?: string;
    items: StoreProduct[];
}

export const CheckoutAside: React.FC<Props> = ({
    className,
    items,
}): JSX.Element => {
    const [isPending, startTransition] = useTransition();

    const removeFromCart = useShopStore(state => state.removeFromCart);

    const handleRemove = (productId: string) => {
        startTransition(async () => {
            await removeFromCart(productId);
        });
    };
    const total = items.reduce((sum, item) => sum + item.price, 0);
    return (
        <aside className={cn('lg:col-span-2', className)}>
            <div className="sticky top-32 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="mb-6 text-xl font-jane tracking-wider">
                    Order Summary
                </h2>
                <div className="min-h-[200px] border-b border-white/10 mb-6 pb-6 space-y-4">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 relative"
                            >
                                {isPending && (
                                    <Skeleton className="h-full w-full absolute top-0 left-0 z-10" />
                                )}
                                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
                                    <Image
                                        src={item.thumbnailFront}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-jane tracking-wide">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-white/50">
                                        Size: {item.size}
                                    </p>
                                </div>
                                <div className="flex flex-col  gap-2 ">
                                    <span className="font-medium">
                                        {formatPrice(item.price)}
                                    </span>
                                    <RemoveItemButton
                                        handleRemove={() =>
                                            handleRemove(item.id)
                                        }
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm italic">
                            Your cart is empty...
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-between text-xl font-bold mb-8">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <CheckoutSubmitButton
                    disabled={items.length === 0 || isPending}
                />
            </div>
        </aside>
    );
};
