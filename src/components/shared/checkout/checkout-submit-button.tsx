'use client';

import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/store/checkout';
import React, { JSX } from 'react';

interface Props {
    // Статичный флаг с сервера: пустая ли корзина
    disabled?: boolean;
}

export const CheckoutSubmitButton: React.FC<Props> = ({
    disabled,
}): JSX.Element => {
    // Реактивно читаем флаг процесса оформления из стора
    const isCheckingOut = useCheckoutStore(s => s.isCheckingOut);
    const isFormValid = useCheckoutStore(s => s.isFormValid);

    console.log('isFormValid', isFormValid);
    console.log('isCheckingOut', isCheckingOut);
    console.log('disabled', disabled);

    return (
        <Button
            type="submit"
            className="w-full h-14 rounded-full font-jane text-sm tracking-widest bg-amber-500
             text-black hover:bg-amber-600 cursor-pointer disabled:opacity-60 
             disabled:bg-amber-500/30 disabled:cursor-not-allowed"
            form="checkout-form" // Связка по ID формы
            disabled={!isFormValid || isCheckingOut || disabled}
        >
            {isCheckingOut || isFormValid
                ? 'Proceed to Payment'
                : 'Fill out the form ...'}
        </Button>
    );
};
