'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useShopStoreApi } from '@/components/shop-store-provider';
export function SignOutButton() {
    const router = useRouter();
    const storeApi = useShopStoreApi();
    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    storeApi.getState().resetStore();
                    toast.success('До встречи!');
                    router.push('/');
                    router.refresh();
                },
            },
        });
    };

    return (
        <Button
            variant="destructive"
            onClick={handleSignOut}
            className="text-white/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all gap-2 rounded-full px-6 cursor-pointer flex items-center justify-center"
        >
            SIGN OUT
        </Button>
    );
}
