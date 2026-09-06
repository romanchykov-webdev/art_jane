'use client';

import { useShopStoreApi } from '@/components/shop-store-provider';
import { useEffect, useRef } from 'react';

export function ClearCartOnSuccess() {
    // 1. Получаем доступ к API стора (без подписки на изменения)
    const storeApi = useShopStoreApi();

    // 2. Гвард для защиты от двойного рендера
    const clearedRef = useRef(false);

    useEffect(() => {
        // Если мы уже очистили корзину — выходим
        if (clearedRef.current) return;
        clearedRef.current = true;

        // 3. Вызываем метод напрямую из актуального состояния
        storeApi.getState().clearCart();
    }, [storeApi]);

    // Компонент Headless — он ничего не рендерит в DOM
    return null;
}
