'use client';

import { Prisma } from '@/generated/prisma';
import { Heart, Package, ShoppingCart } from 'lucide-react';

import { AnimatedProfileList } from '@/components/shared/profile/animated-profile-list';
import { EmptyTabState } from '@/components/shared/profile/empty-tab-state';
import { OrderCard } from '@/components/shared/profile/order-card';
import { TabTriggerItem } from '@/components/shared/profile/tab-trigger-item';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';

import { useShopStore } from '@/components/shop-store-provider';
type ProfileOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
interface ProfileTabsProps {
    orders: ProfileOrder[];
}
export function ProfileTabs({ orders }: ProfileTabsProps) {
    const currentFavorites = useShopStore(state => state.favorites);
    const currentCart = useShopStore(state => state.cart);

    return (
        <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-2xl h-auto md:h-16 mb-8 gap-1 md:gap-0 ">
                <TabTriggerItem value="collection">
                    <span className="cursor-pointer">
                        MY COLLECTION ({currentFavorites.length})
                    </span>
                </TabTriggerItem>

                <TabTriggerItem value="reservations">
                    <span className="cursor-pointer">
                        RESERVATIONS ({currentCart.length})
                    </span>
                </TabTriggerItem>

                <TabTriggerItem value="orders">
                    <span className="cursor-pointer">
                        ORDER HISTORY ({orders.length})
                    </span>
                </TabTriggerItem>
            </TabsList>

            <TabsContent value="collection" className="space-y-6">
                {currentFavorites.length > 0 ? (
                    <AnimatedProfileList
                        type="favorite"
                        items={currentFavorites}
                    />
                ) : (
                    <EmptyTabState
                        icon={<Heart className="w-12 h-12 text-white/10" />}
                        text="Your collection is empty"
                    />
                )}
            </TabsContent>

            <TabsContent value="reservations" className="space-y-6">
                {currentCart.length > 0 ? (
                    <AnimatedProfileList type="cart" items={currentCart} />
                ) : (
                    <EmptyTabState
                        icon={
                            <ShoppingCart className="w-12 h-12 text-white/10" />
                        }
                        text="No active reservations"
                    />
                )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
                {orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <EmptyTabState
                        icon={<Package className="w-12 h-12 text-white/10" />}
                        text="No previous orders"
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}
