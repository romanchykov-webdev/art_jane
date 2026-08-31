import { ButtonGoHome } from '@/components/shared/button-go-home';
import { ClearCartOnSuccess } from '@/components/shared/checkout/clear-cart-on-success';
import { resolveOutcome, type OrderView } from '@/lib/checkout-outcome';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ session_id?: string }>;
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
