import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import './globals.css';

// fonts
import { MobileFabs } from '@/components/shared/mobile-fabs';
import { janeFont } from '@/lib/fonts';
import { Inter } from 'next/font/google';

// Импорты для Hydration Pipeline
import { getShopState } from '@/actions/shop-actions';
import { GuestSyncBridge } from '@/components/shared/guest-sync-bridge';
import { StoreInitializer } from '@/components/shared/store-initializer';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Jane Art | Кастомная одежда',
    description: 'Уникальная одежда ручной росписи',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Чтение корзины и избранного из БД на стороне сервера
    const { cart, favorites } = await getShopState();
    return (
        <html lang="ru" className="scroll-smooth">
            <body
                className={`${inter.variable} ${janeFont.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
            >
                {/* ДОБАВЛЕНО: Невидимый клиентский мост заливает данные в Zustand */}
                <StoreInitializer cart={cart} favorites={favorites} />

                {/* ДОБАВЛЕНО: Глобальный слушатель слияния */}
                <GuestSyncBridge />
                {/* Header (Navbar) */}
                <main className="grow flex flex-col">{children}</main>
                {/* Footer */}
                <Toaster />
                <MobileFabs />
            </body>
        </html>
    );
}
