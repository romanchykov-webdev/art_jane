import { OrderStatus } from '@/generated/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Тесты решения, которое принимает страница успеха: провести заказ, показать
 * «платёж обрабатывается» или отказать.
 *
 * Проверяется ПОВЕДЕНИЕ, а не устройство брони: какой ответ получит покупатель
 * и была ли мутация. Поэтому набор переживёт переход на складские остатки —
 * там поменяется внутренность fulfillOrder, но не контракт «оплачено /
 * обрабатывается / не подтверждено» и не правило «чужой заказ не трогаем».
 */

const retrieve = vi.fn();
const findUnique = vi.fn();
const getSession = vi.fn();
const fulfillOrder = vi.fn();

// isSessionPaid оставляем настоящей: это чистая функция, подменять её значило
// бы тестировать заглушку вместо реального правила «деньги получены».
vi.mock('@/lib/stripe', async importOriginal => {
    const actual = await importOriginal<typeof import('@/lib/stripe')>();
    return {
        ...actual,
        stripe: { checkout: { sessions: { retrieve } } },
    };
});

vi.mock('@/lib/prisma', () => ({ prisma: { order: { findUnique } } }));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession } } }));
vi.mock('@/lib/orders', () => ({ fulfillOrder }));
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));

const { resolveOutcome } = await import('@/lib/checkout-outcome');

const OWNER_ID = 'user-owner';
const ORDER_ID = 'order-1';
const SESSION_ID = 'cs_test_1';

/** Сессия Stripe: оплачена или нет, с orderId в metadata. */
function stripeSession({
    paid = true,
    // null, а не undefined: при деструктуризации undefined подставил бы
    // значение по умолчанию, и «сессия без orderId» стала бы обычной.
    orderId = ORDER_ID as string | null,
} = {}) {
    return {
        id: SESSION_ID,
        payment_status: paid ? 'paid' : 'unpaid',
        metadata: orderId ? { orderId } : {},
    };
}

/** Заказ в том виде, в каком его отдаёт первый select. */
function order({
    // Приведение обязательно: без него TS сузит тип до литерала 'PENDING'
    // и не даст передать в хелпер другой статус.
    status = OrderStatus.PENDING as OrderStatus,
    userId = OWNER_ID as string | null,
} = {}) {
    return {
        id: ORDER_ID,
        status,
        userId,
        totalAmount: 12000,
        items: [
            {
                id: 'item-1',
                titleAtOrder: 'Платье',
                priceAtOrder: 12000,
                product: { slug: 'plate', thumbnailFront: '/front.webp' },
            },
        ],
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    retrieve.mockResolvedValue(stripeSession());
    findUnique.mockResolvedValue(order());
    getSession.mockResolvedValue({ user: { id: OWNER_ID } });
    fulfillOrder.mockResolvedValue(true);
});

describe('resolveOutcome — доступ к заказу', () => {
    it('не проводит и не показывает ЧУЖОЙ заказ', async () => {
        // Главный инвариант фикса: session_id оседает в истории браузера,
        // и по этой ссылке нельзя ни прочитать, ни провести чужой заказ.
        getSession.mockResolvedValue({ user: { id: 'user-stranger' } });

        const outcome = await resolveOutcome(SESSION_ID);

        expect(outcome).toEqual({ kind: 'unconfirmed' });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it('не проводит заказ для неавторизованного посетителя', async () => {
        getSession.mockResolvedValue(null);

        const outcome = await resolveOutcome(SESSION_ID);

        expect(outcome).toEqual({ kind: 'unconfirmed' });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it('не проводит заказ без владельца', async () => {
        findUnique.mockResolvedValue(order({ userId: null }));

        const outcome = await resolveOutcome(SESSION_ID);

        expect(outcome).toEqual({ kind: 'unconfirmed' });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });
});

describe('resolveOutcome — недостаточно данных', () => {
    it('отказывает без session_id, не обращаясь к Stripe', async () => {
        expect(await resolveOutcome(undefined)).toEqual({
            kind: 'unconfirmed',
        });
        expect(retrieve).not.toHaveBeenCalled();
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it('отказывает, если в metadata сессии нет orderId', async () => {
        retrieve.mockResolvedValue(stripeSession({ orderId: null }));

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it('отказывает, если заказа нет в базе', async () => {
        findUnique.mockResolvedValue(null);

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it('не роняет страницу, если Stripe недоступен', async () => {
        retrieve.mockRejectedValue(new Error('network down'));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
    });
});

describe('resolveOutcome — проведение заказа', () => {
    it('проводит оплаченный PENDING-заказ и показывает его состав', async () => {
        const outcome = await resolveOutcome(SESSION_ID);

        expect(fulfillOrder).toHaveBeenCalledExactlyOnceWith(ORDER_ID);
        expect(outcome.kind).toBe('paid');
        expect(outcome.kind === 'paid' && outcome.order.status).toBe(
            OrderStatus.PAID
        );
        expect(outcome.kind === 'paid' && outcome.order.items).toHaveLength(1);
    });

    it('не трогает бронь, пока деньги в пути', async () => {
        // SEPA, Klarna и прочие отложенные методы: сессия завершена,
        // payment_status = unpaid. Судьбу заказа решит async-вебхук.
        retrieve.mockResolvedValue(stripeSession({ paid: false }));

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'processing',
        });
        expect(fulfillOrder).not.toHaveBeenCalled();
    });

    it.each([OrderStatus.PAID, OrderStatus.SHIPPED])(
        'показывает уже проведённый заказ (%s) без повторной мутации',
        async status => {
            findUnique.mockResolvedValue(order({ status }));

            const outcome = await resolveOutcome(SESSION_ID);

            expect(outcome.kind).toBe('paid');
            expect(outcome.kind === 'paid' && outcome.order.status).toBe(
                status
            );
            expect(fulfillOrder).not.toHaveBeenCalled();
        }
    );
});

describe('resolveOutcome — деньги пришли на непроводимый заказ', () => {
    it('не показывает ложное «оплачено», если заказ уже отменён', async () => {
        findUnique.mockResolvedValue(order({ status: OrderStatus.CANCELLED }));
        const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
        expect(fulfillOrder).not.toHaveBeenCalled();
        // Сирота: ни один ретрай Stripe её не починит, нужны руки —
        // поэтому случай обязан быть заметен в логах.
        expect(logged.mock.calls[0]?.[0]).toContain(
            'ALARM_ORPHAN_PAYMENT_SUCCESS_PAGE'
        );
    });

    it('не поднимает тревогу на отменённом заказе без оплаты', async () => {
        // Обычная ситуация: покупатель открыл старую ссылку на протухшую бронь.
        findUnique.mockResolvedValue(order({ status: OrderStatus.CANCELLED }));
        retrieve.mockResolvedValue(stripeSession({ paid: false }));
        const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
        expect(logged).not.toHaveBeenCalled();
    });
});

describe('resolveOutcome — гонка с вебхуком', () => {
    it('показывает «оплачено», если заказ успел провести вебхук', async () => {
        // fulfillOrder вернула false: между нашим чтением и мутацией статус
        // сменил кто-то ещё. Перечитали — заказ проведён, всё в порядке.
        fulfillOrder.mockResolvedValue(false);
        findUnique
            .mockResolvedValueOnce(order())
            .mockResolvedValueOnce({ status: OrderStatus.PAID });

        const outcome = await resolveOutcome(SESSION_ID);

        expect(outcome.kind).toBe('paid');
        expect(outcome.kind === 'paid' && outcome.order.status).toBe(
            OrderStatus.PAID
        );
    });

    it('отказывает и поднимает тревогу, если заказ успели отменить', async () => {
        fulfillOrder.mockResolvedValue(false);
        findUnique
            .mockResolvedValueOnce(order())
            .mockResolvedValueOnce({ status: OrderStatus.CANCELLED });
        const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await resolveOutcome(SESSION_ID)).toEqual({
            kind: 'unconfirmed',
        });
        expect(logged.mock.calls[0]?.[0]).toContain(
            'ALARM_ORPHAN_PAYMENT_SUCCESS_PAGE'
        );
    });
});
