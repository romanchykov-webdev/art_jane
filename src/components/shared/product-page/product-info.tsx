'use client';

import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export interface ProductInfoData {
    id: string;
    title: string;
    price: number;
    description: string | null;
    size: string;
    status: string;
    category?: {
        name: string;
    } | null;
}

interface ProductInfoProps {
    product: ProductInfoData;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const isAvailable = product.status === 'AVAILABLE';

    const handleBuy = async () => {
        if (!isAvailable) return;

        setIsPurchasing(true);

        try {
            // Симулируем задержку сети 1.5 секунды перед будущим редиректом
            await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="flex flex-col pt-4">
            {/* КАТЕГОРИЯ */}
            {product.category && (
                <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                    {product.category.name}
                </span>
            )}

            {/* НАЗВАНИЕ */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase font-jane mb-6">
                {product.title}
            </h1>

            {/* ЦЕНА */}
            <div className="text-3xl font-bold mb-8">
                {formatPrice(product.price)}
            </div>

            {/* ОПИСАНИЕ */}
            {product.description ? (
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                    {product.description}
                </p>
            ) : (
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed italic">
                    Description is temporarily unavailable.
                </p>
            )}

            {/* ХАРАКТЕРИСТИКИ */}
            <div className="border-t border-border py-6 mb-8">
                <div className="flex justify-between items-center uppercase tracking-wider text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-bold text-lg">{product.size}</span>
                </div>
            </div>

            {/* КНОПКА "Заказать" */}
            <button
                onClick={handleBuy}
                disabled={!isAvailable || isPurchasing}
                className={`relative w-full py-6 rounded-xl uppercase tracking-widest font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                    isAvailable
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
            >
                {isPurchasing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : isAvailable ? (
                    'Reserve / Buy 1-of-1'
                ) : (
                    'Sold Out'
                )}
            </button>
        </div>
    );
}
