import { ButtonGoHome } from '@/components/shared/button-go-home';
import { ClearCartOnSuccess } from '@/components/shared/checkout/clear-cart-on-success';
import { OrderStatus } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { fulfillOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { isSessionPaid, stripe } from '@/lib/stripe';
import { formatPrice } from '@/lib/utils';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ session_id?: string }>;
}

type OrderView = {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    items: {
        id: string;
        titleAtOrder: string;
        priceAtOrder: number;
        product: { slug: string; thumbnailFront: string };
    }[];
};

type Outcome =
    | { kind: 'paid'; order: OrderView }
    | { kind: 'processing' } // отложенный платёж ещё не подтверждён
    | { kind: 'unconfirmed' }; // не смогли сверить заказ со Stripe

/**
 * Страница успеха не просто говорит «спасибо» — она сама сверяет заказ со Stripe
 * и при необходимости завершает его.
 *
 * Раньше единственным местом, где заказ переходил в PAID, был вебхук: если он
 * не доходил (упавший прод, неверный секрет, локальная разработка без
 * `stripe listen`), покупателю показывали «Спасибо за заказ», а в базе висел
 * PENDING, товар оставался RESERVED и корзина не очищалась. Теперь вебхук —
 * страховка, а не единственная точка отказа: кто первым добежал, тот и провёл
 * заказ, `fulfillOrder` идемпотентен.
 */
async function resolveOutcome(sessionId: string | undefined): Promise<Outcome> {
    if (!sessionId) return { kind: 'unconfirmed' };

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const orderId = session.metadata?.orderId;

        if (!orderId) return { kind: 'unconfirmed' };

        // Деньги ещё в пути (SEPA, Klarna и прочие отложенные методы).
        // Бронь не трогаем — её судьбу решит async-вебхук.
        if (!isSessionPaid(session)) return { kind: 'processing' };

        // Проводим заказ прямо здесь, не дожидаясь вебхука.
        await fulfillOrder(orderId);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                userId: true,
                totalAmount: true,
                items: {
                    select: {
                        id: true,
                        titleAtOrder: true,
                        priceAtOrder: true,
                        product: {
                            select: { slug: true, thumbnailFront: true },
                        },
                    },
                },
            },
        });

        if (!order) return { kind: 'unconfirmed' };

        // Состав заказа показываем только владельцу: session_id оседает
        // в истории браузера, и по одной ссылке чужой заказ читать нельзя.
        const authSession = await auth.api.getSession({
            headers: await headers(),
        });

        if (!order.userId || order.userId !== authSession?.user?.id) {
            return { kind: 'unconfirmed' };
        }

        return { kind: 'paid', order };
    } catch (error) {
        console.error('[CHECKOUT_SUCCESS] Не удалось сверить заказ:', error);
        return { kind: 'unconfirmed' };
    }
}

export default async function Page({ searchParams }: PageProps) {
    const { session_id } = await searchParams;
    const outcome = await resolveOutcome(session_id);

    return (
        <div className="min-h-screen w-full bg-black text-white px-4 pt-32 pb-20">
            <div className="mx-auto w-full max-w-2xl">
                <ButtonGoHome />

                {outcome.kind === 'paid' && <PaidView order={outcome.order} />}
                {outcome.kind === 'processing' && <ProcessingView />}
                {outcome.kind === 'unconfirmed' && <UnconfirmedView />}
            </div>

            {/* Корзина в БД уже очищена внутри fulfillOrder — здесь гасим
                клиентский Zustand-стор, который лэйаут мог успеть наполнить
                до того, как заказ был проведён. */}
            {outcome.kind === 'paid' && <ClearCartOnSuccess />}
        </div>
    );
}

function PaidView({ order }: { order: OrderView }) {
    const orderNumber = order.id.split('-')[0].toUpperCase();

    return (
        <div className="mt-8 space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-jane tracking-widest uppercase">
                    Спасибо за заказ!
                </h1>
                <p className="text-white/60">
                    Оплата получена. Мы уже готовим вашу вещь к отправке.
                </p>
                <p className="text-sm text-white/40">
                    Номер заказа:{' '}
                    <span className="font-medium text-amber-500">
                        {orderNumber}
                    </span>
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
                            <Image
                                src={item.product.thumbnailFront}
                                alt={item.titleAtOrder}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>
                        <p className="min-w-0 flex-1 truncate font-jane tracking-wide">
                            {item.titleAtOrder}
                        </p>
                        <span className="font-medium">
                            {formatPrice(item.priceAtOrder)}
                        </span>
                    </div>
                ))}

                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                </div>
            </div>

            <div className="flex justify-center">
                <Link
                    href="/profile"
                    className="h-12 px-8 inline-flex items-center justify-center rounded-full font-jane text-sm tracking-widest bg-amber-500 text-black hover:bg-amber-600 transition-colors"
                >
                    МОИ ЗАКАЗЫ
                </Link>
            </div>
        </div>
    );
}

function ProcessingView() {
    return (
        <div className="mt-8 text-center space-y-4">
            <h1 className="text-4xl font-jane tracking-widest uppercase">
                Платёж обрабатывается
            </h1>
            <p className="text-white/60 mx-auto max-w-md">
                Ваш способ оплаты подтверждается банком — это может занять
                несколько дней. Вещь забронирована за вами, а статус заказа
                появится в профиле, как только деньги дойдут.
            </p>
            <div className="pt-4">
                <Link
                    href="/profile"
                    className="h-12 px-8 inline-flex items-center justify-center rounded-full font-jane text-sm tracking-widest border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                    МОИ ЗАКАЗЫ
                </Link>
            </div>
        </div>
    );
}

function UnconfirmedView() {
    return (
        <div className="mt-8 text-center space-y-4">
            <h1 className="text-4xl font-jane tracking-widest uppercase">
                Не удалось подтвердить заказ
            </h1>
            <p className="text-white/60 mx-auto max-w-md">
                Если деньги были списаны, заказ появится в вашем профиле в
                течение нескольких минут. Если он не появится — напишите нам, мы
                разберёмся.
            </p>
            <div className="pt-4">
                <Link
                    href="/profile"
                    className="h-12 px-8 inline-flex items-center justify-center rounded-full font-jane text-sm tracking-widest border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                    МОИ ЗАКАЗЫ
                </Link>
            </div>
        </div>
    );
}
