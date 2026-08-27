import { getShopState } from '@/actions/shop-actions';
import { CheckoutAside } from '@/components/shared/checkout/checkout-aside';
import { CheckoutContactInfo } from '@/components/shared/checkout/checkout-contact-info';
import { CheckoutErrorDialog } from '@/components/shared/checkout/checkout-error-dialog';
import { CheckoutHeader } from '@/components/shared/checkout/checkout-header';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StoreProduct } from '@/types/product';
import { type UnavailableProduct } from '@/types/checkout';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
    // 1. Оформление заказа доступно только авторизованным: сам server action
    //    всё равно вернёт UNAUTHORIZED, и без этого гарда гость мог открыть
    //    страницу по прямой ссылке, заполнить форму и упереться в тупик.
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/');
    }

    // Читаем корзину на сервере по сессии пользователя
    const { cart } = await getShopState();

    // 2. Достаем данные юзера для формы
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
    const userData = dbUser
        ? {
              firstName: dbUser.firstName || '',
              lastName: dbUser.lastName || '',
              email: dbUser.email || '',
              phone: dbUser.phone || '',
              country: dbUser.country || '',
              city: dbUser.city || '',
              postalCode: dbUser.postalCode || '',
              street: dbUser.street || '',
              state: dbUser.state || '',
          }
        : null;

    const unavailable = await findUnavailableItems(cart, session.user.id);

    // Сумма для сверки с сервером считается по ВСЕЙ корзине: именно её
    // пересчитывает createCheckoutSession, иначе получим ложный CART_CHANGED.
    const totalAmountInCents = cart.reduce((sum, item) => sum + item.price, 0);
    const cartItemsData = cart.map(({ id, title }) => ({ id, title }));

    return (
        <div className="min-h-screen w-full pt-32 pb-20 px-4 sm:px-6 lg:px-12 bg-black text-white relative">
            {/* модалка  */}
            <CheckoutErrorDialog items={cartItemsData} />
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
                    <CheckoutAside items={cart} unavailable={unavailable} />
                </div>
            </div>
        </div>
    );
}

/**
 * Находит позиции корзины, которые нельзя оплатить прямо сейчас.
 *
 * Раньше это выяснялось только постфактум — по провалу server action, — поэтому
 * проданная вещь висела в списке обычной оплачиваемой строкой и гарантировала
 * ошибку при сабмите.
 *
 * Тонкость: RESERVED не всегда чужая бронь. Если покупатель вернулся со Stripe
 * кнопкой «Назад» (или через bfcache), его собственные товары числятся
 * забронированными — помечать их недоступными было бы неверно.
 */
async function findUnavailableItems(
    cart: StoreProduct[],
    userId: string
): Promise<UnavailableProduct[]> {
    const blocked = cart.filter(item => item.status !== 'AVAILABLE');
    if (blocked.length === 0) return [];

    const ownPendingOrders = await prisma.order.findMany({
        where: {
            userId,
            status: 'PENDING',
            expiresAt: { gt: new Date() },
        },
        select: { items: { select: { productId: true } } },
    });

    const ownReservedIds = new Set(
        ownPendingOrders.flatMap(order =>
            order.items.map(item => item.productId)
        )
    );

    return blocked
        .filter(item => item.status === 'SOLD' || !ownReservedIds.has(item.id))
        .map(item => ({
            id: item.id,
            reason:
                item.status === 'SOLD'
                    ? ('SOLD' as const)
                    : ('RESERVED' as const),
        }));
}
