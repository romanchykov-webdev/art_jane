import { create } from 'zustand';

// Примерная структура твоего стора:
interface CheckoutState {
    isCheckingOut: boolean;
    isFormValid: boolean; // Твое новое поле
    setCheckingOut: (val: boolean) => void;
    setFormValid: (val: boolean) => void; // Твой новый метод
}

export const useCheckoutStore = create<CheckoutState>(set => ({
    isCheckingOut: false,
    isFormValid: false,
    setCheckingOut: val => set({ isCheckingOut: val }),
    setFormValid: val => set({ isFormValid: val }),
}));
