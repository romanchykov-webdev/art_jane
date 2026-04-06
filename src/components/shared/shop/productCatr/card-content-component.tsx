'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface Props {
    product: {
        title: string;
        size: string;
        category?: { name: string };
    };
    formattedPrice: string;
    toggleSide: (e: React.MouseEvent) => void;
}

export function CardContentComponent({
    product,
    formattedPrice,
    toggleSide,
}: Props) {
    return (
        <CardContent className="p-0 grow relative mb-5 px-2">
            {/* СТРЕЛКИ СЛАЙДЕРА */}
            <div className="w-full flex items-center justify-between transition-opacity duration-300 mb-5">
                <Button
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-70"
                    onClick={toggleSide}
                >
                    <ChevronLeft className="size-10" />
                </Button>
                <Button
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-background/80 backdrop-blur hover:bg-background opacity-70"
                    onClick={toggleSide}
                >
                    <ChevronRight className="size-10" />
                </Button>
            </div>

            <div className="flex justify-between items-center">
                {/* description */}
                <div className="flex flex-col">
                    {product.category?.name && (
                        <span className="text-sm font-semibold tracking-wider text-white uppercase mb-2 text-shadow-md">
                            {product.category.name}
                        </span>
                    )}
                    <h3 className="text-md  leading-none tracking-tight uppercase font-bold text-shadow-md">
                        {product.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground uppercase text-shadow-xs">
                        <span className="text-white">Size : </span>
                        {product.size}
                    </p>
                </div>

                {/* price */}
                <div className=" h-full flex self-end">
                    <p className="text-xl font-bold whitespace-nowrap text-shadow-md">
                        {formattedPrice}
                    </p>
                </div>
            </div>
        </CardContent>
    );
}
