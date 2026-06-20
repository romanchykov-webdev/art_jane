'use client';

import { syncGuestDataToUser } from '@/actions/auth-actions';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useShopStoreApi } from '@/components/shop-store-provider';

export function GuestSyncBridge() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const storeApi = useShopStoreApi();

    const hasSyncedRef = useRef(false);
    const lastUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (isPending || !session?.user) return;

        const currentUserId = session.user.id;

        if (hasSyncedRef.current && lastUserIdRef.current === currentUserId) {
            return;
        }

        hasSyncedRef.current = true;
        lastUserIdRef.current = currentUserId;

        const runSync = async () => {
            try {
                const result = await syncGuestDataToUser();

                if (result.success && result.data) {
                    storeApi
                        .getState()
                        .initStore(result.data.cart, result.data.favorites);
                    router.refresh();
                } else if (!result.success) {
                    console.error('[GUEST_SYNC_BRIDGE_ERROR]', result.error);
                    toast.error('Failed to sync your cart');
                    hasSyncedRef.current = false;
                }
            } catch (error) {
                console.error('[GUEST_SYNC_BRIDGE_EXCEPTION]', error);
                hasSyncedRef.current = false;
            }
        }; // ← закрываем runSync

        runSync(); // ← вызов ПОСЛЕ определения, вне тела функции
    }, [session?.user, isPending, router, storeApi]);

    return null;
}
