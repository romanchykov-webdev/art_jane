'use client';

import { syncGuestDataToUser } from '@/actions/auth-actions';
import { useSession } from '@/lib/auth-client';
import { useShopStore } from '@/store/use-shop-store';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function GuestSyncBridge() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    // Мутексы (locks) для защиты от состояния гонки и двойного рендера (React Strict Mode)
    const hasSyncedRef = useRef(false);
    const lastUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        // 1. Ждем загрузки сессии. Если юзера нет - выходим.
        if (isPending || !session?.user) return;

        const currentUserId = session.user.id;

        // 2. Идемпотентность: если мы уже синхронизировали ЭТОГО юзера, ничего не делаем.
        // Это защищает БД от спама при любом случайном ре-рендере компонента.
        if (hasSyncedRef.current && lastUserIdRef.current === currentUserId) {
            return;
        }

        // 3. Мгновенно блокируем повторные вызовы (до await!)
        hasSyncedRef.current = true;
        lastUserIdRef.current = currentUserId;

        // 4. Запускаем изолированную асинхронную функцию
        const runSync = async () => {
            try {
                const result = await syncGuestDataToUser();

                if (result.success && result.data) {
                    // Атомарно заливаем новые данные напрямую в стейт, минуя хуки
                    useShopStore
                        .getState()
                        .initStore(result.data.cart, result.data.favorites);

                    // Инвалидируем серверный кэш Next.js 16.2.1, чтобы обновить страницу профиля,
                    // если юзер уже находится на ней.
                    router.refresh();
                } else if (!result.success) {
                    console.error('[GUEST_SYNC_BRIDGE_ERROR]', result.error);
                    toast.error('Failed to sync your cart'); //Не удалось синхронизировать корзину
                    // В случае реальной ошибки снимаем блокировку, чтобы дать шанс при следующем заходе
                    hasSyncedRef.current = false;
                }
            } catch (error) {
                console.error('[GUEST_SYNC_BRIDGE_EXCEPTION]', error);
                hasSyncedRef.current = false;
            }
        };

        runSync();
    }, [session?.user, isPending, router]);

    // Компонент - чисто логический. Он не загрязняет DOM.
    return null;
}
