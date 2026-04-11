'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

import { signIn, signUp, useSession } from '@/lib/auth-client';
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    User,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// ИМПОРТИРУЕМ НАШ ИДЕАЛЬНЫЙ СТЕКЛЯННЫЙ ПЕРЕКЛЮЧАТЕЛЬ
import { GlassTabs } from './glass-tabs';

export function AuthDialog() {
    const { data: session, isPending } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Вместо shadcn Tabs используем простой стейт для нашего GlassTabs
    const [activeTab, setActiveTab] = useState('login');

    // Стейты для форм
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    // Стейты видимости паролей
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- ОБРАБОТЧИКИ (Оставлены без изменений) ---

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: window.location.href,
            });
        } catch (error) {
            toast.error(`Ошибка входа через Google: ${error}`);
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
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Неверный email или пароль';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Пароли не совпадают!');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signUp.email({ email, password, name });
            if (error) throw error;

            toast.success('Аккаунт успешно создан!');
            setIsOpen(false);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Ошибка регистрации';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setName('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setActiveTab('login'); // Сбрасываем на вкладку логина
        }
        setIsOpen(open);
    };

    // --- РЕНДЕР СОСТОЯНИЙ ---

    if (isPending) {
        return (
            <button
                className="relative text-muted-foreground transition-colors duration-300"
                disabled
            >
                <Loader2 strokeWidth={1.5} className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    if (session?.user) {
        return (
            <Link
                href="/profile"
                className="relative text-white hover:text-white/80 transition-colors duration-300 outline-none block"
            >
                <User strokeWidth={1.5} className="w-5 h-5" />
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative text-muted-foreground hover:text-white transition-colors duration-300 outline-none cursor-pointer"
            >
                <User strokeWidth={1.5} className="w-5 h-5" />
            </button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                {/* ВНЕШНИЙ СЛОЙ СТЕКЛА 
                    Убираем стандартный фон shadcn и делаем первый слой p-1
                */}
                <DialogContent
                    className="
                        sm:max-w-[420px] 
                        p-1
                        !bg-black/20 
                        backdrop-blur-md 
                        border-white/10 
                        shadow-2xl 
                        !rounded-3xl
                        text-white
                    "
                >
                    {/* ВНУТРЕННИЙ СЛОЙ СТЕКЛА
                        Точно как в твоем GlassTabs
                    */}
                    <div className="p-6 bg-black/20 backdrop-blur-md rounded-[20px] border border-white/10 shadow-inner flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-jane tracking-wider text-center text-white">
                                WELCOME
                            </DialogTitle>
                            <DialogDescription className="text-center text-white/60">
                                Join Jane Art to save favorites and track
                                orders.
                            </DialogDescription>
                        </DialogHeader>

                        {/* НАШ СТЕКЛЯННЫЙ ПЕРЕКЛЮЧАТЕЛЬ */}
                        <div className="w-full flex justify-center  mt-2 mb-2">
                            <GlassTabs
                                tabs={[
                                    { id: 'login', label: 'LOGIN' },
                                    { id: 'register', label: 'REGISTRATION' },
                                ]}
                                activeTab={activeTab}
                                onChange={setActiveTab}
                                className=""
                            />
                        </div>

                        {/* ================= ВХОД ================= */}
                        {activeTab === 'login' && (
                            <form
                                onSubmit={handleEmailLogin}
                                className="space-y-4 animate-in fade-in zoom-in-95 duration-300"
                            >
                                <div className="space-y-2 relative">
                                    <Mail className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="login-email"
                                        className="text-white/80"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        required
                                        className="pl-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Lock className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="login-password"
                                        className="text-white/80"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="login-password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        className="pl-10 pr-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-8 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-white text-black hover:bg-white/90 rounded-full font-jane transition-all mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'LOGIN'
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* ================= РЕГИСТРАЦИЯ ================= */}
                        {activeTab === 'register' && (
                            <form
                                onSubmit={handleRegister}
                                className="space-y-4 animate-in fade-in zoom-in-95 duration-300"
                            >
                                <div className="space-y-2 relative">
                                    <UserCircle className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="reg-name"
                                        className="text-white/80"
                                    >
                                        Nickname
                                    </Label>
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        required
                                        className="pl-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Mail className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="reg-email"
                                        className="text-white/80"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        required
                                        className="pl-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Lock className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="reg-password"
                                        className="text-white/80"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="reg-password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        minLength={8}
                                        className="pl-10 pr-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-8 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="space-y-2 relative">
                                    <Lock className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                                    <Label
                                        htmlFor="reg-confirm-password"
                                        className="text-white/80"
                                    >
                                        Repeat Password
                                    </Label>
                                    <Input
                                        id="reg-confirm-password"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        minLength={8}
                                        className="pl-10 pr-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-8 text-white/50 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-white text-black hover:bg-white/90 rounded-full font-jane transition-all mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'REGISTER'
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase"></div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center gap-2 transition-colors"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            Login with Google
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
