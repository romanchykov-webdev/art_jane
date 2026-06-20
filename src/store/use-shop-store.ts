import { toggleCartAction, toggleFavoriteAction } from '@/actions/shop-actions';
import { StoreProduct } from '@/types/product';
import { toast } from 'sonner';
import { createStore } from 'zustand/vanilla';

const sameIds = (a: StoreProduct[], b: StoreProduct[]) =>
    a.length === b.length && a.every((item, i) => item.id === b[i].id);

export interface ShopState {
    cart: StoreProduct[];
    favorites: StoreProduct[];
}

export interface ShopActions {
    toggleCart: (product: StoreProduct) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    toggleFavorite: (product: StoreProduct) => Promise<void>;
    removeFromFavorites: (productId: string) => Promise<void>;
    clearCart: () => void;
    resetStore: () => void;
    initStore: (cart: StoreProduct[], favorites: StoreProduct[]) => void;
}

export type ShopStore = ShopState & ShopActions;

export const defaultShopState: ShopState = {
    cart: [],
    favorites: [],
};

export const createShopStore = (initState: ShopState = defaultShopState) => {
    return createStore<ShopStore>()((set, get) => ({
        ...initState,

        toggleCart: async product => {
            const isInCart = get().cart.some(item => item.id === product.id);

            if (isInCart)
                set(state => ({
                    cart: state.cart.filter(item => item.id !== product.id),
                }));
            else set(state => ({ cart: [...state.cart, product] }));

            try {
                const res = await toggleCartAction(product.id);
                if (!res?.success)
                    throw new Error(res?.error || 'Failed to sync with server');
            } catch (error) {
                console.error('[TOGGLE_CART_ERROR]', error);
                if (isInCart)
                    set(state => ({ cart: [...state.cart, product] }));
                else
                    set(state => ({
                        cart: state.cart.filter(item => item.id !== product.id),
                    }));
                toast.error('Ошибка синхронизации с сервером');
                throw error;
            }
        },

        removeFromCart: async productId => {
            const itemToRestore = get().cart.find(
                item => item.id === productId
            );
            set(state => ({
                cart: state.cart.filter(item => item.id !== productId),
            }));
            try {
                const res = await toggleCartAction(productId, 'remove');
                if (!res?.success)
                    throw new Error(res?.error || 'Failed to sync with server');
            } catch (error) {
                console.error('[REMOVE_CART_ERROR]', error);
                if (itemToRestore)
                    set(state => ({ cart: [...state.cart, itemToRestore] }));
                toast.error('Ошибка удаления из корзины');
                throw error;
            }
        },

        toggleFavorite: async product => {
            const isFavorite = get().favorites.some(
                item => item.id === product.id
            );
            if (isFavorite)
                set(state => ({
                    favorites: state.favorites.filter(
                        item => item.id !== product.id
                    ),
                }));
            else set(state => ({ favorites: [...state.favorites, product] }));

            try {
                const res = await toggleFavoriteAction(product.id);
                if (!res?.success)
                    throw new Error(res?.error || 'Failed to sync with server');
            } catch (error) {
                console.error('[TOGGLE_FAVORITE_ERROR]', error);
                if (isFavorite)
                    set(state => ({
                        favorites: [...state.favorites, product],
                    }));
                else
                    set(state => ({
                        favorites: state.favorites.filter(
                            item => item.id !== product.id
                        ),
                    }));
                toast.error('Ошибка синхронизации с сервером');
                throw error;
            }
        },

        removeFromFavorites: async productId => {
            const itemToRestore = get().favorites.find(
                item => item.id === productId
            );
            set(state => ({
                favorites: state.favorites.filter(
                    item => item.id !== productId
                ),
            }));
            try {
                const res = await toggleFavoriteAction(productId, 'remove');
                if (!res?.success)
                    throw new Error(res?.error || 'Failed to sync with server');
            } catch (error) {
                console.error('[REMOVE_FAVORITE_ERROR]', error);
                if (itemToRestore)
                    set(state => ({
                        favorites: [...state.favorites, itemToRestore],
                    }));
                toast.error('Ошибка удаления из избранного');
                throw error;
            }
        },

        clearCart: () => set({ cart: [] }),
        resetStore: () => set({ cart: [], favorites: [] }),

        initStore: (cart, favorites) =>
            set(state => {
                if (
                    sameIds(state.cart, cart) &&
                    sameIds(state.favorites, favorites)
                ) {
                    return state;
                }
                return { cart, favorites };
            }),
    }));
};

export type ShopStoreApi = ReturnType<typeof createShopStore>;
