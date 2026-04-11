'use client';

import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from '@/lib/auth-client';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function AuthButton() {
    // Хук useSession сам делает запрос к API и возвращает статус авторизации
    const { data: session, isPending } = useSession();

    const handleLogin = async () => {
        try {
            await signIn.social({
                provider: 'google',
                // Куда вернуть юзера после успешного входа
                callbackURL: window.location.href,
            });
        } catch (error) {
            toast.error('Ошибка авторизации');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success('Вы успешно вышли');
                    },
                },
            });
        } catch (error) {
            toast.error('Ошибка при выходе');
        }
    };

    // 1. Состояние загрузки (проверка сессии)
    if (isPending) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </Button>
        );
    }

    // 2. Юзер залогинен: показываем кнопку выхода
    if (session?.user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden md:inline-block">
                    {session.user.name}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Выйти
                </Button>
            </div>
        );
    }

    // 3. Юзер НЕ залогинен: кнопка входа через Google
    return (
        <Button
            onClick={handleLogin}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
        >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Войти через Google</span>
            <span className="sm:hidden">Войти</span>
        </Button>
    );
}
