import { StoreProduct } from '@/types/product';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShopState {
    cart: StoreProduct[];
    favorites: StoreProduct[];

    toggleCart: (product: StoreProduct) => void;
    removeFromCart: (productId: string, size: string) => void;
    toggleFavorite: (product: StoreProduct) => void;
    clearCart: () => void;
}

export const useShopStore = create<ShopState>()(
    persist(
        (set, get) => ({
            cart: [],
            favorites: [],

            toggleCart: product => {
                const { cart } = get();
                const isInCart = cart.some(item => item.id === product.id);

                if (isInCart) {
                    set({ cart: cart.filter(item => item.id !== product.id) });
                } else {
                    set({ cart: [...cart, product] });
                }
            },

            removeFromCart: (productId, size) => {
                set({
                    cart: get().cart.filter(
                        item => !(item.id === productId && item.size === size)
                    ),
                });
            },

            toggleFavorite: product => {
                const { favorites } = get();
                const isFavorite = favorites.some(
                    item => item.id === product.id
                );

                if (isFavorite) {
                    set({
                        favorites: favorites.filter(
                            item => item.id !== product.id
                        ),
                    });
                } else {
                    set({ favorites: [...favorites, product] });
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
