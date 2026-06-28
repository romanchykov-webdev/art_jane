import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

/**
 * Схема контактных данных покупателя для Checkout.
 * Телефон валидируется через isValidPhoneNumber из react-phone-number-input:
 * библиотека отдаёт значение в формате E.164 (+34612345678),
 * а хелпер проверяет номер по правилам конкретной страны.
 */
export const customerInfoSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Слишком длинное имя'),

    lastName: z
        .string()
        .trim()
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(50, 'Слишком длинная фамилия'),

    email: z
        .email('Введите корректный email')
        .trim()
        .toLowerCase()
        .min(1, 'Введите email'),

    // react-phone-number-input при пустом инпуте возвращает undefined,
    // поэтому сначала отсекаем пустоту, затем проверяем валидность номера.
    phone: z
        .string()
        .min(1, 'Введите номер телефона')
        .refine(isValidPhoneNumber, {
            message: 'Некорректный номер телефона',
        }),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;
