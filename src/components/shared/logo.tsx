import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef } from 'react';

interface LogoProps extends ComponentPropsWithoutRef<'div'> {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const textSizes = {
    sm: 'text-sm',
    md: 'text-2xl',
    lg: 'text-4xl',
} as const;

export function Logo({
    className,
    size = 'md',
    text = 'Jane Art',
    ...props
}: LogoProps) {
    return (
        <div
            className={cn(
                'z-20 flex justify-center pointer-events-none text-zinc-800  ',
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    'font-black tracking-widest uppercase text-shadow-lg/30 font-jane text-center',
                    textSizes[size]
                )}
            >
                {text}
            </span>
        </div>
    );
}
