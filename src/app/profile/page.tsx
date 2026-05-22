import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Heart, Package, ShoppingCart } from 'lucide-react';
import { headers as getHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { LogoGoHome } from '@/components/shared/logo-go-home';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';

import { EmptyTabState } from '@/components/shared/profile/empty-tab-state';
import { OrderCard } from '@/components/shared/profile/order-card';
import { ProfileHeader } from '@/components/shared/profile/profile-header';
import { TabTriggerItem } from '@/components/shared/profile/tab-trigger-item';

import { AnimatedProfileList } from '@/components/shared/profile/animated-profile-list';
import { mapToStoreProduct } from '@/lib/mappers';

export default async function ProfilePage() {
    // 1. Проверка сессии на сервере
    const session = await auth.api.getSession({
        headers: await getHeaders(),
    });

    if (!session?.user) {
        redirect('/'); // Если не залогинен — на главную
    }

    // Запрашиваем пользователя + достаем orders с сортировкой
    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            favorites: { include: { product: true } },
            cartItems: { include: { product: true } },
            orders: {
                include: { items: true },
                orderBy: { createdAt: 'desc' }, // Новые заказы сверху
            },
        },
    });

    if (!userData) redirect('/');

    // 2. Превращаем тяжелые ответы Prisma в легкие StoreProduct
    const mappedFavorites = userData.favorites.map(mapToStoreProduct);
    const mappedCartItems = userData.cartItems.map(mapToStoreProduct);
    const orders = userData.orders;

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Логотип */}
                <LogoGoHome
                    classNameWrapper="mb-12"
                    classNameLogo="items-center justify-center flex-1"
                />

                {/* ШАПКА ПРОФИЛЯ */}
                <ProfileHeader user={userData} />

                {/* КОНТЕНТ (ТАБЫ) */}
                <Tabs defaultValue="collection" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-2xl h-auto md:h-16 mb-8 gap-1 md:gap-0">
                        {/* ИЗБРАННОЕ */}
                        <TabTriggerItem value="collection">
                            MY COLLECTION ({mappedFavorites.length})
                        </TabTriggerItem>

                        {/* КОРЗИНА */}
                        <TabTriggerItem value="reservations">
                            RESERVATIONS ({mappedCartItems.length})
                        </TabTriggerItem>

                        {/* ИСТОРИЯ ЗАКАЗОВ */}
                        <TabTriggerItem value="orders">
                            ORDER HISTORY ({orders.length})
                        </TabTriggerItem>
                    </TabsList>

                    {/* ИЗБРАННОЕ */}
                    <TabsContent value="collection" className="space-y-6">
                        {mappedFavorites.length > 0 ? (
                            <AnimatedProfileList
                                type="favorite"
                                initialItems={mappedFavorites}
                            />
                        ) : (
                            <EmptyTabState
                                icon={
                                    <Heart className="w-12 h-12 text-white/10" />
                                }
                                text="Your collection is empty"
                            />
                        )}
                    </TabsContent>

                    {/* КОРЗИНА */}
                    <TabsContent value="reservations" className="space-y-6">
                        {mappedCartItems.length > 0 ? (
                            <AnimatedProfileList
                                type="cart"
                                initialItems={mappedCartItems}
                            />
                        ) : (
                            <EmptyTabState
                                icon={
                                    <ShoppingCart className="w-12 h-12 text-white/10" />
                                }
                                text="No active reservations"
                            />
                        )}
                    </TabsContent>

                    {/* ИСТОРИЯ ЗАКАЗОВ */}
                    <TabsContent value="orders" className="space-y-6">
                        {orders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {orders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        ) : (
                            <EmptyTabState
                                icon={
                                    <Package className="w-12 h-12 text-white/10" />
                                }
                                text="No previous orders"
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
