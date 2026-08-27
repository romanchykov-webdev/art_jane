'use client';

import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/store/checkout';
import { Loader2 } from 'lucide-react';
import React, { JSX } from 'react';

interface Props {
    disabled?: boolean;
    isLoading?: boolean;
}

export const CheckoutSubmitButton: React.FC<Props> = ({
    disabled,
    isLoading,
}): JSX.Element => {
    // Реактивно читаем все флаги из единого источника истины (Zustand)
    const isCheckingOut = useCheckoutStore(s => s.isCheckingOut);
    const isRedirecting = useCheckoutStore(s => s.isRedirecting);
    const isFormValid = useCheckoutStore(s => s.isFormValid);

    // Объединенный флаг активного процесса
    const isBusy = isCheckingOut || isRedirecting || isLoading;

    return (
        <Button
            type="submit"
            className="w-full h-14 rounded-full font-jane text-sm tracking-widest bg-amber-500
             text-black hover:bg-amber-600 cursor-pointer disabled:opacity-60 
             disabled:bg-amber-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            form="checkout-form"
            disabled={!isFormValid || isBusy || disabled}
        >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRedirecting
                ? 'Redirecting to Payment...'
                : isCheckingOut
                  ? 'Processing...'
                  : isFormValid
                    ? 'Proceed to Payment'
                    : 'Fill out the form ...'}
        </Button>
    );
};
