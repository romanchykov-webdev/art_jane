import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import Image from 'next/image';
import React, { JSX } from 'react';

interface Props {
    className?: string;
    items: StoreProduct[];
}

export const CheckoutAside: React.FC<Props> = ({
    className,
    items,
}): JSX.Element => {
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
                                className="flex items-center gap-4"
                            >
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
                                <span className="font-medium">
                                    {formatPrice(item.price)}
                                </span>
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
                <Button
                    type="submit"
                    form="checkout-form"
                    disabled={items.length === 0}
                    className="w-full h-14 rounded-full font-jane text-sm tracking-widest bg-amber-500 text-black hover:bg-amber-600 cursor-pointer"
                >
                    PROCEED TO PAYMENT
                </Button>
            </div>
        </aside>
    );
};
