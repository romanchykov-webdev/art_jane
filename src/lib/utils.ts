import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Форматирует цену из копеек/центов (хранение в БД) в строку с валютой
 * Например: 15000 -> "150 €", 8950 -> "89,50 €"
 */
export function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toLocaleString('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}
