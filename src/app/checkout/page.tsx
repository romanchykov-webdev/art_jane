import { getShopState } from '@/actions/shop-actions';
import { CheckoutAside } from '@/components/shared/checkout/checkout-aside';
import { CheckoutContactInfo } from '@/components/shared/checkout/checkout-contact-info';
import { CheckoutHeader } from '@/components/shared/checkout/checkout-header';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export default async function CheckoutPage() {
    // Читаем корзину на сервере по куке jane_guest_id / сессии
    const { cart } = await getShopState();

    // 2. Получаем пользователя из Better Auth
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // 3. Достаем данные юзера для формы (если авторизован)
    let userData = null;
    if (session?.user) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                country: true,
                city: true,
                postalCode: true,
                street: true,
                state: true,
            },
        });

        // ПРЕОБРАЗОВАНИЕ (DTO): Заменяем null на пустые строки
        if (dbUser) {
            userData = {
                firstName: dbUser.firstName || '',
                lastName: dbUser.lastName || '',
                email: dbUser.email || '',
                phone: dbUser.phone || '',
                country: dbUser.country || '',
                city: dbUser.city || '',
                postalCode: dbUser.postalCode || '',
                street: dbUser.street || '',
                state: dbUser.state || '',
            };
        }
    }
    // console.log('CheckoutPage:', { userData });

    const totalAmountInCents = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen w-full pt-32 pb-20 px-4 sm:px-6 lg:px-12 bg-black text-white relative">
            <div className="mx-auto max-w-7xl">
                <CheckoutHeader />

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
                    {/* ЛЕВАЯ КОЛОНКА (60%) — Форма */}
                    <CheckoutContactInfo
                        productIds={cart.map(item => item.id)}
                        initialUserDetails={userData}
                        expectedTotal={totalAmountInCents}
                    />

                    {/* ПРАВАЯ КОЛОНКА (40%) — Order Summary */}
                    <CheckoutAside items={cart} />
                </div>
            </div>
        </div>
    );
}
