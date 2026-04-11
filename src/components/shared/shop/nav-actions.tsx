'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { AuthDialog } from '../auth-dialog';

export function NavActions() {
    // ВРЕМЕННЫЙ СТЕЙТ ДЛЯ ТЕСТА АНИМАЦИЙ
    const [cartCount, setCartCount] = useState(14);
    const [favCount, setFavCount] = useState(25);

    return (
        <div className="flex items-center gap-6 ml-auto pl-6 pr-6 border-l border-amber-300/30 snap-end shrink-0">
            {/* 1. ЛОГИН */}

            <AuthDialog />

            {/* 2. ИЗБРАННОЕ  */}
            <button
                aria-label="Add to favorites"
                onClick={() => setFavCount(prev => prev + 1)} // Тестовый клик
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

            {/* 3. КОРЗИНА  */}
            <button
                aria-label="Add to cart"
                onClick={() => setCartCount(prev => prev + 1)} // Тестовый клик
                className={`hidden md:flex relative transition-colors duration-300 cursor-pointer ${
                    cartCount > 0
                        ? 'text-amber-500'
                        : 'text-muted-foreground hover:text-amber-500'
                }`}
            >
                <ShoppingBag strokeWidth={1.5} className="w-5 h-5" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-even-sm">
                        {cartCount}
                    </span>
                )}
            </button>
        </div>
    );
}
