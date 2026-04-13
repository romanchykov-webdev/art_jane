'use client';

import { Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { signIn, useSession } from '@/lib/auth-client';
import { GlassTabs } from '../glass-tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

// экшен слияния
import { syncGuestDataToUser } from '@/actions/auth-actions';

export function AuthDialog() {
    const { data: session, isPending } = useSession();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // --- ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ СЛИЯНИЯ ---
    // Срабатывает каждый раз, когда меняется состояние пользователя
    useEffect(() => {
        if (session?.user) {
            // Запускаем в фоне без await, чтобы не блокировать UI.
            syncGuestDataToUser().catch(console.error);
        }
    }, [session?.user]);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: window.location.href,
            });
        } catch (error) {
            toast.error(`Ошибка входа через Google: ${error}`);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setActiveTab('login');
        }
        setIsOpen(open);
    };

    const handleSuccess = () => {
        setIsOpen(false);
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
                className="relative text-amber-500 hover:text-amber-500/80 transition-colors duration-300 outline-none block"
            >
                <User strokeWidth={1.5} className="w-5 h-5" />
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative text-muted-foreground hover:text-amber-500 transition-colors duration-300 outline-none cursor-pointer"
            >
                <User strokeWidth={1.5} className="w-5 h-5" />
            </button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[420px] p-1 !bg-black/20 backdrop-blur-md border-white/10 shadow-2xl !rounded-3xl text-white">
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

                        <div className="w-full flex justify-center mt-2 mb-2">
                            <GlassTabs
                                tabs={[
                                    { id: 'login', label: 'LOGIN' },
                                    { id: 'register', label: 'REGISTRATION' },
                                ]}
                                activeTab={activeTab}
                                onChange={setActiveTab}
                            />
                        </div>

                        {/* РЕНДЕР ФОРМ */}
                        {activeTab === 'login' ? (
                            <LoginForm onSuccess={handleSuccess} />
                        ) : (
                            <RegisterForm onSuccess={handleSuccess} />
                        )}

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center gap-2 transition-colors"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
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
