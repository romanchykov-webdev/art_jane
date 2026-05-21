'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useShopStore } from '@/store/use-shop-store';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // 1. Синхронно "убиваем" память фронтенда (Zustand)
                    useShopStore.getState().resetStore();

                    // 2. Отправляем визуальный фидбек
                    toast.success('До встречи!');

                    // 3. Запускаем Soft Navigation на главную
                    router.push('/');

                    // 4. Инвалидируем серверный кэш Next.js 16.2.1
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
