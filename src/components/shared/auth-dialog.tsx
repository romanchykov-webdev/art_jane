'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signIn, signOut, signUp, useSession } from '@/lib/auth-client';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AuthDialog() {
    const { data: session, isPending } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Стейты для форм
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // --- ОБРАБОТЧИКИ ---

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: window.location.href,
            });
        } catch (error) {
            toast.error('Ошибка входа через Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await signIn.email({ email, password });
            if (error) throw error;

            toast.success('С возвращением!');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await signUp.email({ email, password, name });
            if (error) throw error;

            toast.success('Аккаунт успешно создан!');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    // --- РЕНДЕР СОСТОЯНИЙ ---

    if (isPending) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </Button>
        );
    }

    if (session?.user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden md:inline-block">
                    {session.user.name}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Выйти
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                    <LogIn className="w-4 h-4" />
                    <span>Войти</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-jane uppercase tracking-wider text-center">
                        Добро пожаловать
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Войдите в аккаунт, чтобы сохранять избранное и
                        отслеживать заказы.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="login" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                    </TabsList>

                    {/* Вкладка ВХОД */}
                    <TabsContent value="login">
                        <form
                            onSubmit={handleEmailLogin}
                            className="space-y-4 mt-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Пароль</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Войти'
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Вкладка РЕГИСТРАЦИЯ */}
                    <TabsContent value="register">
                        <form
                            onSubmit={handleRegister}
                            className="space-y-4 mt-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="reg-name">Имя (Никнейм)</Label>
                                <Input
                                    id="reg-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Пароль</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Создать аккаунт'
                                )}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Или
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Продолжить с Google
                </Button>
            </DialogContent>
        </Dialog>
    );
}
