'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { formatPrice } from '@/lib/utils';
import { useShopStore } from '@/store/use-shop-store';
import { Heart, X } from 'lucide-react';
import Image from 'next/image';

interface FavoriteSheetProps {
    children: React.ReactNode;
    favCount: number;
    side?: 'left' | 'right';
}

export function FavoriteSheet({
    children,
    favCount,
    side = 'right',
}: FavoriteSheetProps) {
    // Подключаем Store
    const favorites = useShopStore(state => state.favorites);
    const toggleFavorite = useShopStore(state => state.toggleFavorite);

    const cart = useShopStore(state => state.cart);
    const toggleCart = useShopStore(state => state.toggleCart);

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side={side}
                className="w-full sm:max-w-md bg-black/40 backdrop-blur-2xl border-white/10 text-white p-6 flex flex-col shadow-2xl"
            >
                {/* ШАПКА */}
                <SheetHeader className="border-b border-white/10 pb-4 shrink-0">
                    <SheetTitle className="text-2xl font-jane tracking-wider text-white flex items-center gap-3">
                        <Heart className="w-5 h-5" />
                        FAVORITES
                        <span className="text-sm bg-white text-black px-2 py-0.5 rounded-full ml-auto font-sans">
                            {favCount} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {/* СПИСОК ТОВАРОВ */}
                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar pr-2">
                    {favorites.length === 0 ? (
                        // ПУСТОЕ СОСТОЯНИЕ
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 h-full">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Heart className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50 font-medium">
                                Your wishlist is empty
                            </p>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="mt-2 rounded-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                                >
                                    DISCOVER ART
                                </Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        // СПИСОК ИЗБРАННОГО
                        favorites.map(item => {
                            // Проверяем, есть ли уже этот товар в корзине
                            const isInCart = cart.some(
                                cartItem => cartItem.id === item.id
                            );

                            return (
                                <div
                                    key={`${item.id}-${item.size}`}
                                    className="flex gap-4 group"
                                >
                                    {/* КАРТИНКА */}
                                    <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* ИНФО О ТОВАРЕ */}
                                    <div className="flex flex-col justify-between py-1 flex-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-jane text-md leading-tight line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        toggleFavorite(item)
                                                    }
                                                    className="text-white/40 hover:text-rose-500 transition-colors p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {item.size && (
                                                <p className="text-white/50 text-sm mt-1">
                                                    Size: {item.size}
                                                </p>
                                            )}
                                        </div>

                                        {/* ЦЕНА И КНОПКА */}
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="font-medium text-lg">
                                                {formatPrice
                                                    ? formatPrice(item.price)
                                                    : `${item.price} €`}
                                            </p>

                                            <Button
                                                size="sm"
                                                onClick={() => toggleCart(item)}
                                                variant={
                                                    isInCart
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                                className={`rounded-full font-jane text-xs tracking-wider transition-colors h-8 px-4 ${
                                                    isInCart
                                                        ? 'bg-white/20 text-white hover:bg-rose-500 hover:text-white'
                                                        : 'bg-white text-black hover:bg-white/90'
                                                }`}
                                            >
                                                {isInCart
                                                    ? 'REMOVE'
                                                    : 'ADD TO CART'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
