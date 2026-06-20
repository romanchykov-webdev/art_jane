'use client';
import {
    type ShopState,
    type ShopStore,
    type ShopStoreApi,
    createShopStore,
} from '@/store/use-shop-store';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
const ShopStoreContext = createContext<ShopStoreApi | undefined>(undefined);
interface ShopStoreProviderProps {
    children: ReactNode;
    initialState: ShopState;
}
export function ShopStoreProvider({
    children,
    initialState,
}: ShopStoreProviderProps) {
    // Ленивый инициализатор: стор создаётся один раз, значение можно читать в рендере.
    const [store] = useState(() => createShopStore(initialState));
    return (
        <ShopStoreContext.Provider value={store}>
            {children}
        </ShopStoreContext.Provider>
    );
}

// Хук-селектор — прямая замена прежнего useShopStore(state => ...)
export function useShopStore<T>(selector: (store: ShopStore) => T): T {
    const storeApi = useContext(ShopStoreContext);
    if (!storeApi) {
        throw new Error('useShopStore must be used within ShopStoreProvider');
    }
    return useStore(storeApi, selector);
}

// Доступ к самому инстансу стора — для getState() вне рендера
// (обработчики событий, эффекты).
export function useShopStoreApi(): ShopStoreApi {
    const storeApi = useContext(ShopStoreContext);
    if (!storeApi) {
        throw new Error(
            'useShopStoreApi must be used within ShopStoreProvider'
        );
    }
    return storeApi;
}
