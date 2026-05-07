'use client';

import { useShopStore } from '@/store/use-shop-store';
import { StoreProduct } from '@/types/product';
import { useRef } from 'react';

interface StoreInitializerProps {
    cart: StoreProduct[];
    favorites: StoreProduct[];
}

export function StoreInitializer({ cart, favorites }: StoreInitializerProps) {
    // Используем useRef, чтобы гарантировать, что инициализация
    // произойдет ровно ОДИН раз за жизненный цикл компонента
    const initialized = useRef(false);

    if (!initialized.current) {
        // Заливаем данные напрямую в стейт, минуя хуки (чтобы избежать лишних рендеров)
        useShopStore.getState().initStore(cart, favorites);
        initialized.current = true;
    }

    return null; // Этот компонент ничего не рисует в DOM
}
