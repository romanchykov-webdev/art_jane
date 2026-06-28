import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { ButtonGoHome } from '../button-go-home';
import { Logo } from '../logo';

interface Props {
    className?: string;
}

export const CheckoutHeader: React.FC<Props> = ({ className }): JSX.Element => {
    return (
        <div className={cn('', className)}>
            <Logo
                className="absolute left-0 right-0 top-4 md:top-8  [&>span]:text-shadow-white"
                size="lg"
            />
            <ButtonGoHome className="mb-8" />
            <h1 className="mb-8 text-4xl font-jane tracking-widest uppercase">
                Checkout
            </h1>
        </div>
    );
};
