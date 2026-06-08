'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';

import { useShopStore } from '@/store/use-shop-store';
import { StoreProduct } from '@/types/product';
import { ProfileItemCard } from './profile-item-card';

interface AnimatedProfileListProps {
    initialItems: StoreProduct[];
    type: 'favorite' | 'cart';
}

export function AnimatedProfileList({
    initialItems,
    type,
}: AnimatedProfileListProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [optimisticItems, removeOptimisticItem] = useOptimistic<
        StoreProduct[],
        string
    >(initialItems, (state, idToRemove) =>
        state.filter(item => item.id !== idToRemove)
    );

    const handleRemove = (item: StoreProduct) => {
        startTransition(async () => {
            try {
                removeOptimisticItem(item.id);

                // Обязательно дёргаем Zustand, чтобы обновились бейджики в шапке сайта
                if (type === 'favorite') {
                    await useShopStore.getState().removeFromFavorites(item.id);
                } else {
                    await useShopStore.getState().removeFromCart(item.id);
                }

                router.refresh();
            } catch (error) {
                console.error('[ANIMATED_LIST_REMOVE_ERROR]', error);
            }
        });
    };

    if (optimisticItems.length === 0) {
        return (
            <div className="flex justify-center items-center py-10 opacity-50">
                <p className="text-sm">No items found.</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
                {optimisticItems.map(item => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full"
                    >
                        <ProfileItemCard
                            item={item}
                            type={type}
                            onRemove={() => handleRemove(item)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
