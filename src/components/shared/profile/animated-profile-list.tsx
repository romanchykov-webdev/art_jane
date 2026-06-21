'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useShopStoreApi } from '@/components/shop-store-provider';
import { StoreProduct } from '@/types/product';
import { useCallback } from 'react';
import { ProfileItemCard } from './profile-item-card';

interface AnimatedProfileListProps {
    items: StoreProduct[];
    type: 'favorite' | 'cart';
}

export function AnimatedProfileList({ items, type }: AnimatedProfileListProps) {
    const storeApi = useShopStoreApi();
    const handleRemove = useCallback(
        async (id: string) => {
            try {
                const store = storeApi.getState();
                if (type === 'favorite') await store.removeFromFavorites(id);
                else await store.removeFromCart(id);
            } catch {
                /* toast уже показан в сторе */
            }
        },
        [type, storeApi]
    );
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
                {items.map(item => (
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
                            onRemove={() => handleRemove(item.id)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
