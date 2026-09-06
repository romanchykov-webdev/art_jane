import { describe, expect, it } from 'vitest';
import { customerInfoSchema } from '@/lib/validations/checkout';

/**
 * Схема — последний рубеж перед тем, как данные уедут в Stripe и в Order:
 * форма на клиенте валидирует те же поля, но server action обязан считать
 * клиентскую проверку несуществующей.
 */
const validPayload = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'Ivan.Petrov@Example.COM',
    phone: '+34612345678',
    country: 'Испания',
    city: 'Барселона',
    postalCode: '08001',
    street: 'Carrer de Mallorca, 401',
    state: 'Каталония',
};

/** Возвращает пути полей, на которых схема споткнулась. */
function failedPaths(payload: Record<string, unknown>): string[] {
    const result = customerInfoSchema.safeParse(payload);
    return result.success
        ? []
        : result.error.issues.map(issue => issue.path.join('.'));
}

describe('customerInfoSchema', () => {
    it('пропускает полный корректный набор данных', () => {
        expect(customerInfoSchema.safeParse(validPayload).success).toBe(true);
    });

    it('приводит email к нижнему регистру', () => {
        // В Order.customerEmail и в Stripe должен уезжать нормализованный
        // адрес, иначе один и тот же покупатель выглядит как двое разных.
        const result = customerInfoSchema.safeParse(validPayload);
        expect(result.success && result.data.email).toBe(
            'ivan.petrov@example.com'
        );
    });

    it('обрезает пробелы по краям', () => {
        const result = customerInfoSchema.safeParse({
            ...validPayload,
            city: '  Барселона  ',
        });
        expect(result.success && result.data.city).toBe('Барселона');
    });

    it('считает state необязательным', () => {
        const withoutState: Record<string, unknown> = { ...validPayload };
        delete withoutState.state;

        expect(customerInfoSchema.safeParse(withoutState).success).toBe(true);
    });

    it('отклоняет email без @ и домена', () => {
        // Регрессия: до фикса схема проверяла только непустоту, и в Stripe
        // уезжал адрес, на который нельзя отправить подтверждение заказа.
        expect(failedPaths({ ...validPayload, email: 'ivan' })).toContain(
            'email'
        );
    });

    it('отклоняет email без доменной зоны', () => {
        expect(
            failedPaths({ ...validPayload, email: 'ivan@example' })
        ).toContain('email');
    });

    it('отклоняет некорректный номер телефона', () => {
        expect(failedPaths({ ...validPayload, phone: '+3461' })).toContain(
            'phone'
        );
    });

    it('отклоняет пустой номер телефона', () => {
        expect(failedPaths({ ...validPayload, phone: '' })).toContain('phone');
    });

    it('отклоняет слишком короткое имя', () => {
        expect(failedPaths({ ...validPayload, firstName: 'И' })).toContain(
            'firstName'
        );
    });

    it.each(['city', 'street', 'postalCode', 'country'] as const)(
        'отклоняет пустое обязательное поле доставки: %s',
        field => {
            expect(failedPaths({ ...validPayload, [field]: '' })).toContain(
                field
            );
        }
    );

    it('отклоняет поле доставки из одних пробелов', () => {
        // trim() выполняется до проверки длины, поэтому «   » — пустое поле,
        // а не строка из трёх символов.
        expect(failedPaths({ ...validPayload, street: '   ' })).toContain(
            'street'
        );
    });
});
