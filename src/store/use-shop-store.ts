import { toggleCartAction, toggleFavoriteAction } from '@/actions/shop-actions';
import { StoreProduct } from '@/types/product';
import { toast } from 'sonner';
import { create } from 'zustand';

interface ShopState {
    cart: StoreProduct[];
    favorites: StoreProduct[];
    toggleCart: (product: StoreProduct) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    toggleFavorite: (product: StoreProduct) => Promise<void>;
    removeFromFavorites: (productId: string) => Promise<void>;
    clearCart: () => void;
    resetStore: () => void;
    initStore: (cart: StoreProduct[], favorites: StoreProduct[]) => void;
}

export const useShopStore = create<ShopState>()((set, get) => ({
    cart: [],
    favorites: [],

    toggleCart: async product => {
        const previousCart = get().cart;
        const isInCart = previousCart.some(item => item.id === product.id);
        if (isInCart)
            set({ cart: previousCart.filter(item => item.id !== product.id) });
        else set({ cart: [...previousCart, product] });

        try {
            const res = await toggleCartAction(product.id);
            if (!res?.success)
                throw new Error(res?.error || 'Failed to sync with server');
        } catch (error) {
            console.error('[TOGGLE_CART_ERROR]', error);
            set({ cart: previousCart });
            toast.error('Ошибка синхронизации с сервером');
        }
    },

    removeFromCart: async productId => {
        const previousCart = get().cart;
        set({ cart: previousCart.filter(item => item.id !== productId) });

        try {
            const res = await toggleCartAction(productId, 'remove');
            if (!res?.success)
                throw new Error(res?.error || 'Failed to sync with server');
        } catch (error) {
            console.error('[TOGGLE_FAVORITE_ERROR]', error);
            set({ cart: previousCart });
            toast.error('Ошибка удаления из корзины');
        }
    },

    toggleFavorite: async product => {
        const previousFavorites = get().favorites;
        const isFavorite = previousFavorites.some(
            item => item.id === product.id
        );
        if (isFavorite)
            set({
                favorites: previousFavorites.filter(
                    item => item.id !== product.id
                ),
            });
        else set({ favorites: [...previousFavorites, product] });

        try {
            const res = await toggleFavoriteAction(product.id);
            if (!res?.success)
                throw new Error(res?.error || 'Failed to sync with server');
        } catch (error) {
            console.error('[TOGGLE_FAVORITE_ERROR]', error);
            set({ favorites: previousFavorites });
            toast.error('Ошибка синхронизации с сервером');
        }
    },

    removeFromFavorites: async productId => {
        const previousFavorites = get().favorites;
        set({
            favorites: previousFavorites.filter(item => item.id !== productId),
        });

        try {
            const res = await toggleFavoriteAction(productId, 'remove');
            if (!res?.success)
                throw new Error(res?.error || 'Failed to sync with server');
        } catch (error) {
            console.error('[REMOVE_FAVORITE_ERROR]', error);

            set({ favorites: previousFavorites });
            toast.error('Ошибка удаления из избранного');
        }
    },

    clearCart: () => set({ cart: [] }),
    resetStore: () => set({ cart: [], favorites: [] }),
    initStore: (cart, favorites) => set({ cart, favorites }),
}));
