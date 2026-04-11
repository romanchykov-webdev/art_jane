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
import { ShoppingBag, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

interface CartSheetProps {
    children: React.ReactNode;
    cartCount: number;
}

export function CartSheet({ children, cartCount }: CartSheetProps) {
    //  Store
    const cart = useShopStore(state => state.cart);
    const removeFromCart = useShopStore(state => state.removeFromCart);

    // Считаем общую сумму корзины
    const totalPrice = cart.reduce((total, item) => total + item.price, 0);

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
                {/* СПИСОК ТОВАРОВ */}
                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar pr-2">
                    {cart.length === 0 ? (
                        // ПУСТОЕ СОСТОЯНИЕ
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
                        // СПИСОК ДОБАВЛЕННЫХ ТОВАРОВ
                        cart.map(item => (
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
                                            <h3 className="font-jane text-lg leading-tight line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.id,
                                                        item.size
                                                    )
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

                                    {/* ЦЕНА И СЧЕТЧИК */}
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="font-medium text-lg">
                                            {formatPrice
                                                ? formatPrice(item.price)
                                                : `${item.price} €`}
                                        </p>

                                        {/* УПРАВЛЕНИЕ КОЛИЧЕСТВОМ */}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ФУТЕР  */}
                {cart.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-white/10 space-y-4 shrink-0  pb-4">
                        <div className="flex justify-between text-xl font-jane tracking-wider">
                            <span className="text-white/80">TOTAL</span>
                            <span>
                                {formatPrice
                                    ? formatPrice(totalPrice)
                                    : `${totalPrice} €`}
                            </span>
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
