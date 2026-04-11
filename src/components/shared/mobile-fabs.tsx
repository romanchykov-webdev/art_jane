'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import { CartSheet } from './cart-sheet';
import { FavoriteSheet } from './favorite-sheet';

import { useHasMounted } from '@/hooks/use-has-mounted';
import { useShopStore } from '@/store/use-shop-store';

export function MobileFabs() {
    const cart = useShopStore(state => state.cart);
    const favorites = useShopStore(state => state.favorites);

    // ИСПРАВЛЕНО ДЛЯ 1-OF-1
    const cartCount = cart.length;
    const favCount = favorites.length;

    // Защита от Hydration Error
    const isMounted = useHasMounted();

    if (!isMounted || (cartCount === 0 && favCount === 0)) return null;

    return (
        // md:hidden скрывает этот блок на десктопе
        <div className="md:hidden">
            {/* ИЗБРАННОЕ (Слева внизу) */}
            {favCount > 0 && (
                <div className="fixed bottom-2 left-0 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <FavoriteSheet favCount={favCount} side="left">
                        <button className="relative w-12 h-12 bg-amber-500 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white shadow-2xl outline-none">
                            <Heart
                                strokeWidth={1.5}
                                className="w-10 h-10 fill-red-500 "
                            />
                            <span className="absolute z-10 text-2xl text-white font-jane text-shadow-lg">
                                {favCount}
                            </span>
                        </button>
                    </FavoriteSheet>
                </div>
            )}

            {/* КОРЗИНА (Справа внизу) */}
            {cartCount > 0 && (
                <div className="fixed bottom-2 right-1 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CartSheet cartCount={cartCount}>
                        <button className="relative w-14 h-14 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-even-md outline-none">
                            <ShoppingCart
                                strokeWidth={1.5}
                                className="w-10 h-10"
                            />
                            <span className="absolute z-10 text-2xl text-white font-jane  text-shadow-lg">
                                {cartCount}
                            </span>
                        </button>
                    </CartSheet>
                </div>
            )}
        </div>
    );
}
