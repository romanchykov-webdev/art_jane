'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import { AuthDialog } from '../auth-dialog';
import { CartSheet } from '../cart-sheet';
import { FavoriteSheet } from '../favorite-sheet';

import { useHasMounted } from '@/hooks/use-has-mounted';
import { useShopStore } from '@/store/use-shop-store';

export function NavActions() {
    // 1. Берем данные из глобального стора
    const cart = useShopStore(state => state.cart);
    const favorites = useShopStore(state => state.favorites);

    // 2. Считаем количество товаров (ИСПРАВЛЕНО ДЛЯ 1-OF-1)
    const cartCount = cart.length;
    const favCount = favorites.length;

    // 3. Идеальная защита от Hydration Error
    const isMounted = useHasMounted();
    if (!isMounted) return null;
    return (
        <div className="flex items-center gap-6 ml-auto pl-6 pr-6 border-l border-amber-300/30 snap-end shrink-0">
            {/* 1. ЛОГИН */}

            <AuthDialog />

            {/* 2. ИЗБРАННОЕ  */}
            <FavoriteSheet favCount={favCount} side="right">
                <button
                    aria-label="Add to favorites"
                    className={`hidden md:flex relative transition-colors duration-300 cursor-pointer ${
                        favCount > 0
                            ? 'text-amber-500'
                            : 'text-muted-foreground hover:text-amber-500'
                    }`}
                >
                    <Heart strokeWidth={1.5} className="w-5 h-5" />
                    {favCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-even-sm">
                            {favCount}
                        </span>
                    )}
                </button>
            </FavoriteSheet>

            {/* 3. КОРЗИНА  */}
            <CartSheet cartCount={cartCount}>
                <button
                    aria-label="Add to cart"
                    className={`hidden md:flex relative transition-colors duration-300 cursor-pointer ${
                        cartCount > 0
                            ? 'text-amber-500'
                            : 'text-muted-foreground hover:text-amber-500'
                    }`}
                >
                    <ShoppingCart strokeWidth={1.5} className="w-5 h-5" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-even-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </CartSheet>
        </div>
    );
}
