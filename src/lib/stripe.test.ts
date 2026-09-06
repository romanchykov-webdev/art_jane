import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import { isSessionPaid } from '@/lib/stripe';

/**
 * Здесь проверяется ровно одно решение: «получены ли деньги».
 *
 * Цена ошибки — товар в единственном экземпляре уходит в SOLD без оплаты,
 * поэтому проверяются все значения payment_status, а не только счастливый путь.
 */
const sessionWith = (
    paymentStatus: Stripe.Checkout.Session['payment_status']
) => ({ payment_status: paymentStatus }) as Stripe.Checkout.Session;

describe('isSessionPaid', () => {
    it('считает оплаченной сессию с payment_status = paid', () => {
        expect(isSessionPaid(sessionWith('paid'))).toBe(true);
    });

    it('считает оплаченной сессию, где оплата не требовалась', () => {
        // no_payment_required — нулевая сумма (например, полная скидка).
        // Денег не пришло, но и ждать их неоткуда: заказ можно проводить.
        expect(isSessionPaid(sessionWith('no_payment_required'))).toBe(true);
    });

    it('НЕ считает оплаченной сессию с payment_status = unpaid', () => {
        // Ровно этот случай даёт checkout.session.completed у SEPA и Klarna:
        // сессия завершена, деньги ещё в пути.
        expect(isSessionPaid(sessionWith('unpaid'))).toBe(false);
    });

    it('НЕ считает оплаченной сессию с неизвестным статусом', () => {
        // Если Stripe однажды добавит новое значение, поведение по умолчанию
        // должно быть консервативным: не проводить заказ.
        expect(
            isSessionPaid({
                payment_status: 'something_new',
            } as unknown as Stripe.Checkout.Session)
        ).toBe(false);
    });
});
