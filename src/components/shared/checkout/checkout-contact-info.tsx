import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { CheckoutForm } from './checkout-form';

interface Props {
    className?: string;
}

export const CheckoutContactInfo: React.FC<Props> = ({
    className,
}): JSX.Element => {
    return (
        <section className={cn('lg:col-span-3', className)}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <h2 className="mb-8 text-2xl font-jane tracking-wider">
                    Contact Information
                </h2>
                <CheckoutForm />
            </div>
        </section>
    );
};
