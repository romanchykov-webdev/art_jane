import { cn } from '@/lib/utils';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';

interface ButtonGoHomeProps extends Omit<
    ComponentPropsWithoutRef<typeof Link>,
    'href'
> {
    size?: 'sm' | 'md' | 'lg';
    href?: string;
}

const iconSizes = {
    sm: 'size-6',
    md: 'size-10',
    lg: 'size-12',
} as const;

export function ButtonGoHome({
    className,
    size = 'md',
    href = '/',
    ...props
}: ButtonGoHomeProps) {
    return (
        <Link
            {...props}
            href={href}
            className={cn(
                'w-20 h-20 flex items-center justify-center rounded-full bg-amber-500 shadow-even-md',
                'hover:bg-amber-600 transition-all duration-500 hover:shadow-even-lg cursor-pointer pointer-events-auto',
                className
            )}
        >
            <HomeIcon className={cn('size-10', iconSizes[size])} />
        </Link>
    );
}
