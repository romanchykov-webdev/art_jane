import Stripe from 'stripe';

/**
 * Единый клиент Stripe на всё приложение.
 *
 * Держим версию API в одном месте: раньше `new Stripe(...)` вызывался отдельно
 * в server action чекаута, в вебхуке и в cancel-роуте, и строку apiVersion
 * пришлось бы менять в трёх файлах одновременно.
 */
export const STRIPE_API_VERSION = '2026-06-24.dahlia' as const;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION,
});

/**
 * Отвечает ли сессия Stripe за реально полученные деньги.
 *
 * Событие `checkout.session.completed` означает лишь «сессия завершена».
 * У методов с отложенным подтверждением (SEPA Direct Debit, Klarna,
 * банковский перевод) сессия завершается с `payment_status: 'unpaid'`,
 * а деньги приходят позже событием `checkout.session.async_payment_succeeded`
 * либо не приходят вовсе. Для товара в единственном экземпляре разница
 * критична: без этой проверки вещь уйдёт в SOLD без оплаты.
 */
export function isSessionPaid(session: Stripe.Checkout.Session): boolean {
    return (
        session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required'
    );
}
