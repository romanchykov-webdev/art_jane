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
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { SheetItemCard } from './sheet-item-card';

interface CartSheetProps {
    children: React.ReactNode;
    cartCount: number;
}

export function CartSheet({ children, cartCount }: CartSheetProps) {
    const cart = useShopStore(state => state.cart);
    const removeFromCart = useShopStore(state => state.removeFromCart);

    const totalPrice = cart.reduce((total, item) => total + item.price, 0);

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="w-full sm:max-w-md bg-black/40 backdrop-blur-2xl border-l border-white/10 text-white p-6 flex flex-col shadow-2xl">
                <SheetHeader className="border-b border-white/10 pb-4 pt-2">
                    <SheetTitle className="text-2xl font-jane tracking-wider text-white flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5" />
                        CART
                        <span className="text-sm bg-white text-black px-2 py-0.5 rounded-full ml-auto">
                            {cartCount} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar pr-2">
                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 h-full">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <ShoppingBag className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50 font-medium">
                                Your cart is empty
                            </p>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="mt-2 rounded-full border-white/20 bg-transparent hover:bg-white/10 text-white"
                                >
                                    CONTINUE SHOPPING
                                </Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        cart.map(item => (
                            <SheetItemCard
                                key={`${item.id}-${item.size}`}
                                item={item}
                                onRemove={() =>
                                    removeFromCart(item.id, item.size!)
                                }
                            />
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-white/10 space-y-4 shrink-0 pb-4">
                        <div className="flex justify-between text-xl font-jane tracking-wider">
                            <span className="text-white/80">TOTAL</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <Link
                            href="/checkout"
                            className="block w-full"
                            onClick={e => {
                                if (cart.length === 0) e.preventDefault();
                            }}
                        >
                            <Button
                                disabled={cart.length === 0}
                                className="w-full bg-white text-black hover:bg-white/90 rounded-full font-jane transition-all h-14 text-xl tracking-wider"
                            >
                                CHECKOUT
                            </Button>
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
