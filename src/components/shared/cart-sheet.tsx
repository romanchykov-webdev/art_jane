'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart } from 'lucide-react';

interface CartSheetProps {
    children: React.ReactNode;
    cartCount: number;
}

export function CartSheet({ children, cartCount }: CartSheetProps) {
    return (
        <Sheet>
            {/* asChild позволяет передать клик в ту кнопку, которую мы обернем */}
            <SheetTrigger asChild>{children}</SheetTrigger>

            {/* СТИЛИЗАЦИЯ: Темное стекло, выезжает справа */}
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

                {/* КОНТЕНТ КОРЗИНЫ  */}
                <div className="flex-1 overflow-y-auto py-8 flex flex-col items-center justify-center text-center gap-4">
                    {cartCount === 0 ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <ShoppingCart className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50 font-medium">
                                Your cart is empty
                            </p>
                        </>
                    ) : (
                        // Здесь в будущем будет map() по товарам
                        <div className="w-full flex flex-col gap-4">
                            <p className="text-white/50 text-sm">
                                Товары скоро появятся здесь...
                            </p>
                        </div>
                    )}
                </div>

                {/* ФУТЕР  */}
                <div className="mt-auto pt-4 border-t border-white/10 space-y-4">
                    <div className="flex justify-between text-lg font-medium">
                        <span className="text-white/80">Total</span>
                        <span>0 €</span>
                    </div>
                    <Button
                        disabled={cartCount === 0}
                        className="w-full bg-white text-black hover:bg-white/90 rounded-full font-jane transition-all h-12 text-lg"
                    >
                        CHECKOUT
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
