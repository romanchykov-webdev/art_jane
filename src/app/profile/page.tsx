import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import { headers as getHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/shared/auth/sign-out-button';
import { SheetItemCard } from '@/components/shared/sheets/sheet-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ProfilePage() {
    // 1. Проверка сессии на сервере
    const session = await auth.api.getSession({
        headers: await getHeaders(),
    });

    if (!session?.user) {
        redirect('/'); // Если не залогинен — на главную
    }

    // 2. Запрос данных из БД
    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            favorites: { include: { product: true } },
            cartItems: { include: { product: true } },
        },
    });

    if (!userData) redirect('/');

    // 3. Маппинг данных
    const favoriteProducts = userData.favorites.map(f => ({
        id: f.product.id,
        title: f.product.title,
        price: f.product.price,
        size: f.product.size,
        thumbnailFront: f.product.thumbnailFront,
    }));

    const cartProducts = userData.cartItems.map(c => ({
        id: c.product.id,
        title: c.product.title,
        price: c.product.price,
        size: c.product.size,
        thumbnailFront: c.product.thumbnailFront,
    }));

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* ШАПКА ПРОФИЛЯ */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <UserIcon className="w-10 h-10 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-jane tracking-widest uppercase mb-1">
                                {userData.name}
                            </h1>
                            <p className="text-grey/40 font-medium">
                                {userData.email}
                            </p>
                        </div>
                    </div>
                    <SignOutButton />
                </div>

                {/* КОНТЕНТ (ТАБЫ) */}
                <Tabs defaultValue="collection" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-2xl h-16 mb-8">
                        <TabsTrigger
                            value="collection"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black font-jane tracking-widest"
                        >
                            MY COLLECTION ({favoriteProducts.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="reservations"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black font-jane tracking-widest"
                        >
                            RESERVATIONS ({cartProducts.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* ИЗБРАННОЕ */}
                    <TabsContent value="collection" className="space-y-6">
                        {favoriteProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {favoriteProducts.map(item => (
                                    <div
                                        key={item.id}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                                    >
                                        <SheetItemCard
                                            item={item}
                                            // onRemove={() => console.log('onClick')}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40 uppercase tracking-widest">
                                    Your collection is empty
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* КОРЗИНА */}
                    <TabsContent value="reservations" className="space-y-6">
                        {cartProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cartProducts.map(item => (
                                    <div
                                        key={item.id}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                                    >
                                        <SheetItemCard
                                            item={item}
                                            // onRemove={() => {
                                            //     /* Здесь будет логика из ShopActions */
                                            // }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40 uppercase tracking-widest">
                                    No active reservations
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
