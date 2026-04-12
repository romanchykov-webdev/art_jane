import { formatPrice } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import { X } from 'lucide-react';
import Image from 'next/image';

interface SheetItemCardProps {
    item: StoreProduct;
    onRemove: () => void;
    // Слот для дополнительных кнопок (например, "Add to cart" из Избранного)
    actionSlot?: React.ReactNode;
}

export function SheetItemCard({
    item,
    onRemove,
    actionSlot,
}: SheetItemCardProps) {
    return (
        <div className="flex gap-4 group">
            {/* КАРТИНКА */}
            <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                <Image
                    src={item.thumbnailFront}
                    alt={item.title}
                    fill
                    className="object-cover"
                    // sizes="96px"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* ИНФО О ТОВАРЕ */}
            <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-jane text-lg leading-tight line-clamp-2">
                            {item.title}
                        </h3>
                        <button
                            onClick={onRemove}
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

                {/* ЦЕНА И СЛОТ ДЛЯ КНОПОК */}
                <div className="flex items-center justify-between mt-4">
                    <p className="font-medium text-lg">
                        {formatPrice(item.price)}
                    </p>
                    {/* Рендерим переданную кнопку (если она есть) */}
                    {actionSlot && <div>{actionSlot}</div>}
                </div>
            </div>
        </div>
    );
}
