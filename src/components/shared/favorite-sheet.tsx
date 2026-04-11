'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Heart } from 'lucide-react';

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
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side={side}
                className="w-full sm:max-w-md bg-black/40 backdrop-blur-2xl border-white/10 text-white p-6 flex flex-col shadow-2xl"
            >
                <SheetHeader className="border-b border-white/10 pb-4 pt-2">
                    <SheetTitle className="text-2xl font-jane tracking-wider text-white flex items-center gap-3">
                        <Heart className="w-5 h-5" />
                        FAVORITES
                        <span className="text-sm bg-white text-black px-2 py-0.5 rounded-full ml-auto">
                            {favCount} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {/* КОНТЕНТ (Пока заглушка для пустого состояния) */}
                <div className="flex-1 overflow-y-auto py-8 flex flex-col items-center justify-center text-center gap-4">
                    {favCount === 0 ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Heart className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50 font-medium">
                                Your wishlist is empty
                            </p>
                        </>
                    ) : (
                        <div className="w-full flex flex-col gap-4">
                            <p className="text-white/50 text-sm">
                                Любимые товары скоро появятся здесь...
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
