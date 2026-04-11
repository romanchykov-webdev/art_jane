import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    size?: string;
}

interface ShopState {
    cart: Product[]; // quantity больше нет!
    favorites: Product[];

    toggleCart: (product: Product) => void; // НОВОЕ
    removeFromCart: (productId: string, size?: string) => void;
    toggleFavorite: (product: Product) => void;
    clearCart: () => void;
}

export const useShopStore = create<ShopState>()(
    persist(
        (set, get) => ({
            cart: [],
            favorites: [],

            // ДОБАВИТЬ / УБРАТЬ ИЗ КОРЗИНЫ
            toggleCart: product => {
                const { cart } = get();
                const isInCart = cart.some(item => item.id === product.id);

                if (isInCart) {
                    set({ cart: cart.filter(item => item.id !== product.id) });
                } else {
                    set({ cart: [...cart, product] });
                }
            },

            // УБРАТЬ ИЗ КОРЗИНЫ
            removeFromCart: (productId, size) => {
                set({
                    cart: get().cart.filter(
                        item => !(item.id === productId && item.size === size)
                    ),
                });
            },
            // ДОБАВИТЬ / УБРАТЬ ИЗ  (ИЗБРАННОЕ)
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
