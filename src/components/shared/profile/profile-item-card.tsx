'use client';

import { SheetItemCard } from '@/components/shared/sheets/sheet-item-card';
import { useShopStore } from '@/store/use-shop-store';
import { StoreProduct } from '@/types/product';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface ProfileItemCardProps {
    item: StoreProduct;
    type: 'favorite' | 'cart';
}

export function ProfileItemCard({ item, type }: ProfileItemCardProps) {
    const { removeFromCart, toggleFavorite } = useShopStore();
    const router = useRouter();

    //  Хук для плавных фоновых обновлений UI
    const [isPending, startTransition] = useTransition();

    const handleRemove = async () => {
        // Запускаем транзакцию. React пометит isPending = true
        startTransition(async () => {
            try {
                // 1. Мутируем Zustand (шапка обновится мгновенно) + летит запрос в БД
                if (type === 'favorite') {
                    await toggleFavorite(item);
                } else {
                    await removeFromCart(item.id, item.size || '');
                }

                // 2. Инвалидируем клиентский кэш маршрутизатора
                // Так как бэкенд уже сделал revalidatePath('/profile'),
                // этот refresh подтянет с сервера свежий список без удаленного товара.
                router.refresh();
            } catch (error) {
                console.error('[REMOVE_ITEM_ERROR]', error);
            }
        });
    };

    // Если мы ждем ответа от сервера, мы скрываем карточку.
    // Это предотвращает визуальный глитч, когда Zustand уже обновился, а серверный HTML еще старый.
    if (isPending) {
        // Возвращаем пустой фрагмент (или можно вернуть Skeleton, если хочешь)
        // Карточка мгновенно исчезает для пользователя, а через долю секунды
        // router.refresh пришлет HTML, где этой карточки уже физически нет.
        return null;
    }

    return <SheetItemCard item={item} onRemove={handleRemove} type={type} />;
}
