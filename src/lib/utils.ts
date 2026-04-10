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

// Алгоритм Фишера-Йетса для честного рандома.
/**
 * Перемешивает массив и возвращает указанное количество случайных элементов.
 * Использует алгоритм Тасования Фишера — Йетса (Fisher-Yates Shuffle) для обеспечения
 * равномерного распределения вероятности (честный рандом).
 * * @param array - Исходный массив элементов
 * @param count - Количество элементов, которые нужно вернуть
 * @returns Новый массив со случайными элементами
 */
export function getRandomProducts<T>(array: T[], count: number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}
