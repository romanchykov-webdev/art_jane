import { formatPrice } from '@/lib/utils';
import { StoreProduct } from '@/types/product';
import { Heart, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface SheetItemCardProps {
    item: StoreProduct;
    onRemove: () => void;
    type: 'favorite' | 'cart';

    actionSlot?: React.ReactNode;
}

export function SheetItemCard({
    item,
    onRemove,
    actionSlot,
    type,
}: SheetItemCardProps) {
    const Icon = type === 'favorite' ? Heart : X;

    const [isImageLoading, setIsImageLoading] = useState(true);
    return (
        <div className="flex gap-4 group border border-gray-400 rounded-2xl p-2 shadow-even-sm hover:shadow-even-md transition-all duration-300">
            {/* КАРТИНКА  */}
            <Link
                href={`/product/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
                aria-hidden="true"
                className="relative w-24 h-32 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10 block"
            >
                {/* Лоадер */}
                {isImageLoading && (
                    <Loader2 className="w-5 h-5 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 z-0" />
                )}

                {/* Изображение*/}
                <Image
                    src={item.thumbnailFront}
                    alt={item.title}
                    fill
                    sizes="96px"
                    onLoad={() => setIsImageLoading(false)}
                    className={`object-cover transition-all duration-500 z-10 ${
                        isImageLoading
                            ? 'opacity-0 scale-95'
                            : 'opacity-100 group-hover:scale-105'
                    }`}
                />
            </Link>

            {/* ИНФО О ТОВАРЕ */}
            <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        {/* НАЗВАНИЕ  */}
                        <Link
                            href={`/product/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-300 transition-colors"
                        >
                            <h3 className="font-jane text-lg leading-tight line-clamp-2">
                                {item.title}
                            </h3>
                        </Link>

                        {/* КНОПКА УДАЛЕНИЯ */}
                        <button
                            onClick={onRemove}
                            className="text-red-200 hover:text-rose-500 transition-colors p-1 border border-red-200 rounded-full cursor-pointer shrink-0"
                            aria-label={
                                type === 'favorite'
                                    ? 'Remove from collection'
                                    : 'Remove from cart'
                            }
                        >
                            {/* aria-hidden="true" прячет иконку, так как label уже всё объясняет */}
                            <Icon
                                className="w-5 h-5 fill-red-500"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                    {item.size && (
                        <p className="text-gray-400 text-sm mt-1">
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
