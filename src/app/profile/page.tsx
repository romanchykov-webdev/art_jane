import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers as getHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { LogoGoHome } from '@/components/shared/logo-go-home';
import { ProfileHeader } from '@/components/shared/profile/profile-header';
import { ProfileTabs } from '@/components/shared/profile/profile-tabs';

export default async function ProfilePage() {
    // 1. Проверка сессии на сервере
    const session = await auth.api.getSession({
        headers: await getHeaders(),
    });

    if (!session?.user) {
        redirect('/');
    }

    // 2. Запрашиваем пользователя + достаем orders
    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            favorites: { include: { product: true } },
            cartItems: { include: { product: true } },
            orders: {
                include: { items: true },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!userData) redirect('/');

    const orders = userData.orders;

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <LogoGoHome
                    classNameWrapper="mb-12"
                    classNameLogo="items-center justify-center flex-1"
                />

                <ProfileHeader user={userData} />

                {/* 4. Передаем управление клиентскому оркестратору */}
                <ProfileTabs orders={orders} />
            </div>
        </main>
    );
}
