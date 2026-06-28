import { getShopState } from '@/actions/shop-actions';
import { CheckoutAside } from '@/components/shared/checkout/checkout-aside';
import { CheckoutContactInfo } from '@/components/shared/checkout/checkout-contact-info';
import { CheckoutHeader } from '@/components/shared/checkout/checkout-header';

export default async function CheckoutPage() {
    // Читаем корзину на сервере по куке jane_guest_id / сессии
    const { cart } = await getShopState();

    return (
        <div className="min-h-screen w-full pt-32 pb-20 px-4 sm:px-6 lg:px-12 bg-black text-white relative">
            <div className="mx-auto max-w-7xl">
                <CheckoutHeader />

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
                    {/* ЛЕВАЯ КОЛОНКА (60%) — Форма */}
                    <CheckoutContactInfo />

                    {/* ПРАВАЯ КОЛОНКА (40%) — Order Summary */}
                    <CheckoutAside items={cart} />
                </div>
            </div>
        </div>
    );
}
