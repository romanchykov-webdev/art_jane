'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface Props {
    product: {
        title: string;
        size: string;
        category?: { name: string } | null;
    };
    formattedPrice: string;
    toggleSide: (e: React.MouseEvent) => void;
}

export function CardContentComponent({
    product,
    formattedPrice,
    toggleSide,
}: Props) {
    // Единый класс для стеклянных кнопок
    const glassButtonClass = `h-12 w-12 rounded-full cursor-pointer  transition-all duration-300
         flex items-center justify-center text-foreground bg-gray-300 shadow-even-sm  
         hover:bg-gray-400  hover:scale-105 hover-shadow-even-md`;

    return (
        <CardContent className="p-0 grow relative mb-5 px-2">
            {/* СТРЕЛКИ СЛАЙДЕРА (Стеклянные линзы) */}
            <div className="w-full flex items-center justify-between transition-all duration-300 my-5">
                <Button
                    size="icon"
                    className={glassButtonClass}
                    onClick={toggleSide}
                >
                    <ChevronLeft className="size-6" />
                </Button>
                <Button
                    size="icon"
                    className={glassButtonClass}
                    onClick={toggleSide}
                >
                    <ChevronRight className="size-6" />
                </Button>
            </div>

            <div className="flex justify-between items-center">
                {/* description */}
                <div className="flex flex-col">
                    {product.category?.name && (
                        <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2 text-shadow-md">
                            {product.category.name}
                        </span>
                    )}
                    <h3 className="text-md leading-none tracking-tight uppercase font-bold text-shadow-md">
                        {product.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground uppercase text-shadow-xs">
                        <span className="text-gray-500">Size : </span>
                        {product.size}
                    </p>
                </div>

                {/* price */}
                <div className="h-full flex self-end">
                    <p className="text-xl font-bold whitespace-nowrap text-shadow-md">
                        {formattedPrice}
                    </p>
                </div>
            </div>
        </CardContent>
    );
}
