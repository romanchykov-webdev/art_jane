'use client';

import { signIn } from '@/lib/auth-client';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
    onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await signIn.email({ email, password });
            if (error) throw error;

            toast.success('С возвращением!');
            onSuccess();
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

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-in fade-in zoom-in-95 duration-300"
        >
            <div className="space-y-2 relative">
                <Mail className="absolute left-3 top-8 w-4 h-4 text-white/50" />
                <Label htmlFor="login-email" className="text-white/80">
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
                <Label htmlFor="login-password" className="text-white/80">
                    Password
                </Label>
                <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10 pr-10 bg-black/20 border-white/10 text-white focus-visible:ring-white/30 placeholder:text-white/30 rounded-xl"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
    );
}
