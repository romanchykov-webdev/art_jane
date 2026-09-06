'use client';
import { useShopStore } from '@/components/shop-store-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import { useCheckoutStore } from '@/store/checkout';
import { type UnavailableProduct } from '@/types/checkout';
import { StoreProduct } from '@/types/product';
import Image from 'next/image';
import React, { JSX, useTransition } from 'react';
import { CheckoutSubmitButton } from './checkout-submit-button';
import { RemoveItemButton } from './remove-button';

interface Props {
    className?: string;
    items: StoreProduct[];
    /** Позиции, недоступные к оплате, — посчитаны на сервере при рендере. */
    unavailable: UnavailableProduct[];
}

const REASON_LABEL: Record<UnavailableProduct['reason'], string> = {
    SOLD: 'Уже продан — удалите из корзины',
    RESERVED: 'Забронирован другим покупателем',
};

export const CheckoutAside: React.FC<Props> = ({
    className,
    items,
    unavailable,
}): JSX.Element => {
    const [isPending, startTransition] = useTransition();

    const error = useCheckoutStore(s => s.error);
    const resolveUnavailableProduct = useCheckoutStore(
        s => s.resolveUnavailableProduct
    );

    const removeFromCart = useShopStore(state => state.removeFromCart);
    const removeManyFromCart = useShopStore(state => state.removeManyFromCart);

    // Объединяем две картины мира: посчитанную на сервере при рендере страницы
    // и пришедшую от провалившегося сабмита. Вторая свежее, но появляется
    // только после клика, поэтому нужны обе.
    const blockedById = new Map<string, UnavailableProduct['reason']>();
    for (const item of unavailable) blockedById.set(item.id, item.reason);
    if (error?.code === 'PRODUCT_UNAVAILABLE') {
        for (const item of error.unavailableProducts ?? []) {
            blockedById.set(item.id, item.reason);
        }
    }

    // Товар мог быть удалён из корзины — в списке блокировок он больше не нужен
    const blockedIds = items
        .map(item => item.id)
        .filter(id => blockedById.has(id));

    const handleRemove = (productId: string) => {
        startTransition(async () => {
            await removeFromCart(productId);
            // Стор сам вычеркнет товар и разблокирует форму, если он был последним!
            resolveUnavailableProduct(productId);
        });
    };

    const handleRemoveBlocked = () => {
        startTransition(async () => {
            await removeManyFromCart(blockedIds);
            for (const id of blockedIds) resolveUnavailableProduct(id);
        });
    };

    // Итог считаем только по тому, что реально можно оплатить
    const total = items.reduce(
        (sum, item) => (blockedById.has(item.id) ? sum : sum + item.price),
        0
    );

    return (
        <aside className={cn('lg:col-span-2', className)}>
            <div className="sticky top-32 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="mb-6 text-xl font-jane tracking-wider">
                    Order Summary
                </h2>
                <div className="min-h-50 border-b border-white/10 mb-6 pb-6 space-y-4">
                    {items.length > 0 ? (
                        items.map(item => {
                            const reason = blockedById.get(item.id);
                            const isUnavailable = reason !== undefined;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'flex items-center gap-4 relative rounded-xl p-2 transition-colors',
                                        isUnavailable
                                            ? 'bg-red-500/10 border border-red-500/30'
                                            : 'border border-transparent'
                                    )}
                                >
                                    {isPending && (
                                        <Skeleton className="h-full w-full absolute top-0 left-0 z-10 rounded-xl" />
                                    )}
                                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
                                        <Image
                                            src={item.thumbnailFront}
                                            alt={item.title}
                                            fill
                                            className={cn(
                                                'object-cover',
                                                isUnavailable &&
                                                    'opacity-50 grayscale'
                                            )}
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

                                        {reason && (
                                            <p className="text-xs text-red-400 mt-1 font-medium">
                                                {REASON_LABEL[reason]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span
                                            className={cn(
                                                'font-medium',
                                                isUnavailable &&
                                                    'line-through text-white/50'
                                            )}
                                        >
                                            {formatPrice(item.price)}
                                        </span>
                                        <div>
                                            <RemoveItemButton
                                                handleRemove={() =>
                                                    handleRemove(item.id)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-white/50 text-sm italic">
                            Your cart is empty...
                        </p>
                    )}
                </div>

                {blockedIds.length > 0 && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                        <p className="text-sm text-red-300">
                            {blockedIds.length === 1
                                ? 'Одна позиция недоступна к оплате.'
                                : `Недоступных позиций: ${blockedIds.length}.`}{' '}
                            Удалите их, чтобы продолжить.
                        </p>
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full rounded-full cursor-pointer"
                            onClick={handleRemoveBlocked}
                            disabled={isPending}
                        >
                            {blockedIds.length === 1
                                ? 'Удалить позицию'
                                : 'Удалить недоступные'}
                        </Button>
                    </div>
                )}

                <div className="flex items-center justify-between text-xl font-bold mb-8">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>

                <CheckoutSubmitButton
                    disabled={
                        items.length === 0 || isPending || blockedIds.length > 0
                    }
                    isLoading={isPending}
                />
            </div>
        </aside>
    );
};
