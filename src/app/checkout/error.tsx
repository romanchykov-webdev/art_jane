'use client';

import { useEffect } from 'react';

export default function CheckoutError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[CHECKOUT_PAGE_ERROR]', error);
    }, [error]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-4 text-center">
            <h1 className="text-3xl font-jane tracking-wider mb-4">
                Не удалось загрузить корзину
            </h1>

            <p className="text-white/60 max-w-md mb-8">
                Произошла ошибка при загрузке данных о вашей корзине. Пожалуйста,
                обновите страницу и попробуйте ещё раз.
            </p>

            <button
                onClick={() => reset()}
                className="h-12 px-8 rounded-full font-jane text-sm tracking-widest bg-amber-500 text-black hover:bg-amber-600 transition-colors cursor-pointer"
            >
                Обновить страницу
            </button>
        </div>
    );
}
