import { OrderStatus } from '@/generated/prisma';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

interface OrderCardProps {
    order: {
        id: string;
        status: OrderStatus;
        createdAt: Date;
        items: {
            id: string;
            slug: string;
            title: string;
            price: number;
            thumbnailFront: string;
        }[];
    };
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    PENDING: {
        label: 'AWAITING PAYMENT',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    PAID: {
        label: 'PREPARING',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    SHIPPED: {
        label: 'SHIPPED',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    CANCELLED: {
        label: 'CANCELLED',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

function OrderCardBase({ order }: OrderCardProps) {
    const config = statusConfig[order.status];
    const totalAmount = order.items.reduce((sum, item) => sum + item.price, 0);

    const formattedDate = dateFormatter.format(new Date(order.createdAt));

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-6 shadow-2xl group/card">
            {/* ШАПКА ЗАКАЗА */}
            <div className="space-y-4 border-b border-white/10 pb-4">
                <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm text-shadow-md uppercase tracking-wider">
                        Order Date
                    </p>
                    <p className="font-medium tracking-wide">{formattedDate}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-xs text-shadow-md">
                        ID: {order.id.split('-')[0].toUpperCase()}
                    </p>
                    <span
                        className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest border shadow-sm ${config.color}`}
                    >
                        {config.label}
                    </span>
                </div>
            </div>

            {/* ТОВАРЫ В ЗАКАЗЕ  */}
            <div className="space-y-6">
                {order.items.map(item => (
                    <Link
                        href={`/product/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={item.id}
                        className="block relative w-full aspect-4/5 sm:aspect-square md:aspect-4/5 rounded-2xl overflow-hidden shadow-lg group/item cursor-pointer"
                    >
                        {/* ИЗОБРАЖЕНИЕ */}
                        <Image
                            src={item.thumbnailFront}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* GLASSMORPHISM ПЛАШКА */}

                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-between items-end gap-4 transition-colors duration-300 group-hover/item:bg-black/60">
                            <h4 className="font-jane text-xl sm:text-2xl tracking-wide line-clamp-2 text-white text-shadow-lg">
                                {item.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ИТОГО */}
            <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 tracking-widest text-sm text-shadow-md font-jane">
                    TOTAL
                </span>
                <span className="font-bold text-2xl">
                    {formatPrice(totalAmount)}
                </span>
            </div>
        </div>
    );
}
export const OrderCard = memo(OrderCardBase);
