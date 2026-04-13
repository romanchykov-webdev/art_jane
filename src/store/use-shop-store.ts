import { StoreProduct } from '@/types/product';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// серверные экшены
import { toggleCartAction, toggleFavoriteAction } from '@/actions/shop-actions';
import { toast } from 'sonner';

interface ShopState {
    cart: StoreProduct[];
    favorites: StoreProduct[];

    toggleCart: (product: StoreProduct) => Promise<void>;
    removeFromCart: (productId: string, size: string) => Promise<void>;
    toggleFavorite: (product: StoreProduct) => Promise<void>;
    clearCart: () => void;
}

export const useShopStore = create<ShopState>()(
    persist(
        (set, get) => ({
            cart: [],
            favorites: [],

            toggleCart: async product => {
                const previousCart = get().cart;
                const isInCart = previousCart.some(
                    item => item.id === product.id
                );

                // 1. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ UI (Моментально)
                if (isInCart) {
                    set({
                        cart: previousCart.filter(
                            item => item.id !== product.id
                        ),
                    });
                } else {
                    set({ cart: [...previousCart, product] });
                }

                // 2. ФОНОВАЯ СИНХРОНИЗАЦИЯ С БД
                try {
                    const res = await toggleCartAction(product.id);
                    if (!res.success) {
                        throw new Error(
                            res.error || 'Failed to sync with server'
                        );
                    }
                } catch (error) {
                    // 3. ОТКАТ (ROLLBACK) В СЛУЧАЕ ОШИБКИ
                    set({ cart: previousCart });
                    console.error('[TOGGLE_CART_SYNC_ERROR]', error);
                    toast.error('Ошибка синхронизации с сервером');
                }
            },

            removeFromCart: async (productId, size) => {
                const previousCart = get().cart;

                // 1. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
                set({
                    cart: previousCart.filter(
                        item => !(item.id === productId && item.size === size)
                    ),
                });

                // 2. ФОНОВАЯ СИНХРОНИЗАЦИЯ (toggleCartAction сработает как удаление, т.к. товар уже есть в БД)
                try {
                    const res = await toggleCartAction(productId);
                    if (!res.success) {
                        throw new Error(
                            res.error || 'Failed to sync with server'
                        );
                    }
                } catch (error) {
                    // 3. ОТКАТ
                    set({ cart: previousCart });
                    console.error('[REMOVE_CART_SYNC_ERROR]', error);
                    toast.error('Ошибка синхронизации с сервером');
                }
            },

            toggleFavorite: async product => {
                const previousFavorites = get().favorites;
                const isFavorite = previousFavorites.some(
                    item => item.id === product.id
                );

                // 1. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
                if (isFavorite) {
                    set({
                        favorites: previousFavorites.filter(
                            item => item.id !== product.id
                        ),
                    });
                } else {
                    set({ favorites: [...previousFavorites, product] });
                }

                // 2. ФОНОВАЯ СИНХРОНИЗАЦИЯ
                try {
                    const res = await toggleFavoriteAction(product.id);
                    if (!res.success) {
                        throw new Error(
                            res.error || 'Failed to sync with server'
                        );
                    }
                } catch (error) {
                    // 3. ОТКАТ
                    set({ favorites: previousFavorites });
                    console.error('[TOGGLE_FAVORITE_SYNC_ERROR]', error);
                    toast.error('Ошибка синхронизации с сервером');
                }
            },

            clearCart: () => set({ cart: [] }),
        }),
        {
            name: 'jane-art-storage',
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<ShopState>;
                return {
                    ...currentState,
                    ...persisted,
                    cart: (persisted.cart || []).filter(Boolean),
                    favorites: (persisted.favorites || []).filter(Boolean),
                };
            },
        }
    )
);
