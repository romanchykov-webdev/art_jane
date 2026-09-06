import { type CheckoutFailure } from '@/types/checkout';
import { create } from 'zustand';

interface CheckoutStore {
    isCheckingOut: boolean;
    isRedirecting: boolean; // Единый источник истины для навигации на Stripe
    isFormValid: boolean;

    // Храним весь объект ошибки целиком
    error: CheckoutFailure | null;
    isErrorModalOpen: boolean;

    setCheckingOut: (val: boolean) => void;
    setRedirecting: (val: boolean) => void;
    setFormValid: (val: boolean) => void;

    setError: (error: CheckoutFailure) => void;
    closeErrorModal: () => void;
    clearError: () => void;
    resolveUnavailableProduct: (productId: string) => void;
}

export const useCheckoutStore = create<CheckoutStore>(set => ({
    isCheckingOut: false,
    isRedirecting: false,
    isFormValid: false,
    error: null,
    isErrorModalOpen: false,

    setCheckingOut: val => set({ isCheckingOut: val }),
    setRedirecting: val => set({ isRedirecting: val }),
    setFormValid: val => set({ isFormValid: val }),

    // При новой ошибке мы сохраняем данные, открываем модалку И снимаем флаг редиректа
    setError: error =>
        set({ error, isErrorModalOpen: true, isRedirecting: false }),

    closeErrorModal: () => set({ isErrorModalOpen: false }),

    // Полный сброс (при новом сабмите или уходе со страницы)
    clearError: () =>
        set({ error: null, isErrorModalOpen: false, isRedirecting: false }),

    // Пользователь удалил проблемный товар из корзины — вычёркиваем его
    // из ошибки. Когда список опустеет, модалка закрывается сама.
    resolveUnavailableProduct: productId =>
        set(state => {
            const { error } = state;

            if (
                error?.code !== 'PRODUCT_UNAVAILABLE' ||
                !error.unavailableProducts
            ) {
                return {};
            }

            const rest = error.unavailableProducts.filter(
                item => item.id !== productId
            );

            if (rest.length === 0) {
                return { error: null, isErrorModalOpen: false };
            }

            return { error: { ...error, unavailableProducts: rest } };
        }),
}));
