'use client';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';

interface Props {
    isAvailable: boolean;
}

export function CardFooterComponent({ isAvailable }: Props) {
    return (
        <CardFooter className=" p-0 flex font-jane">
            <Button
                variant="destructive"
                className="flex-1 gap-2 rounded-none  py-6 uppercase tracking-widest cursor-pointer
                        text-xs transition-all duration-300 active:scale-[0.98] border-none text-black font-jane    
                        "
                disabled={!isAvailable}
            >
                {isAvailable ? (
                    <ShoppingCart className="size-10 text-black" />
                ) : (
                    ''
                )}

                {isAvailable ? '' : 'Sold Out'}
            </Button>

            {/* separator */}
            <div className="w-1 h-12  bg-black/30"></div>

            <Button
                variant="destructive"
                size="icon"
                className="flex-1 gap-2 rounded-none py-6 uppercase tracking-widest text-xs cursor-pointer
                        transition-all duration-300 active:scale-[0.98]  border-none "
            >
                <Heart className="size-10 text-black" />
            </Button>
        </CardFooter>
    );
}
