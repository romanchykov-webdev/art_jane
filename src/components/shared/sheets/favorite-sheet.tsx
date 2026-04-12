'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useShopStore } from '@/store/use-shop-store';
import { Heart } from 'lucide-react';
import { SheetItemCard } from './sheet-item-card';

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
                <SheetHeader className="border-b border-white/10 pb-4 shrink-0">
                    <SheetTitle className="text-2xl font-jane tracking-wider text-white flex items-center gap-3">
                        <Heart className="w-5 h-5" />
                        FAVORITES
                        <span className="text-sm bg-white text-black px-2 py-0.5 rounded-full ml-auto font-sans">
                            {favCount} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar pr-2">
                    {favorites.length === 0 ? (
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
                        favorites.map(item => {
                            const isInCart = cart.some(
                                cartItem => cartItem.id === item.id
                            );

                            return (
                                <SheetItemCard
                                    key={`${item.id}-${item.size}`}
                                    item={item}
                                    onRemove={() => toggleFavorite(item)}
                                    actionSlot={
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
                                    }
                                />
                            );
                        })
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
