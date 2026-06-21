'use client';

import {
    useShopStore,
    useShopStoreApi,
} from '@/components/shop-store-provider';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { StoreProduct } from '@/types/product';
import React from 'react';

// Явно разрешаем undefined для совместимости с exactOptionalPropertyTypes
interface UseProductActionsOptions {
    isInsideLink?: boolean | undefined;
    onToggleCart?: ((next: { isInCart: boolean }) => void) | undefined;
    onToggleFavorite?: ((next: { isFavorite: boolean }) => void) | undefined;
}

export function useProductActions(
    product: StoreProduct,
    options?: UseProductActionsOptions
) {
    const isMounted = useHasMounted();
    const storeApi = useShopStoreApi();

    const isInCartRaw = useShopStore(state =>
        state.cart.some(item => item.id === product.id)
    );
    const isFavoriteRaw = useShopStore(state =>
        state.favorites.some(item => item.id === product.id)
    );

    const toggleCartStore = useShopStore(state => state.toggleCart);
    const toggleFavoriteStore = useShopStore(state => state.toggleFavorite);

    const isInCart = isMounted ? isInCartRaw : false;
    const isFavorite = isMounted ? isFavoriteRaw : false;

    const isAvailable = product.status === 'AVAILABLE';
    // Fallback 'UNAVAILABLE' добавлен для защиты от пустых кнопок при новых статусах
    const statusLabel =
        product.status === 'SOLD'
            ? 'SOLD OUT'
            : product.status === 'RESERVED'
              ? 'RESERVED'
              : 'UNAVAILABLE';

    const toggleCart = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (options?.isInsideLink) e?.preventDefault();

        if (!isAvailable) return;

        const currentState = storeApi.getState();
        const wasInCart = currentState.cart.some(
            item => item.id === product.id
        );

        toggleCartStore(product).catch(() => {});
        options?.onToggleCart?.({ isInCart: !wasInCart });
    };

    const toggleFavorite = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (options?.isInsideLink) e?.preventDefault();

        const currentState = storeApi.getState();
        const wasFavorite = currentState.favorites.some(
            item => item.id === product.id
        );

        toggleFavoriteStore(product).catch(() => {});
        options?.onToggleFavorite?.({ isFavorite: !wasFavorite });
    };

    return {
        isInCart,
        isFavorite,
        isAvailable,
        statusLabel,
        toggleCart,
        toggleFavorite,
    };
}
