import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import './globals.css';

// fonts
import { MobileFabs } from '@/components/shared/mobile-fabs';
import { janeFont } from '@/lib/fonts';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Jane Art | Кастомная одежда',
    description: 'Уникальная одежда ручной росписи',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className="scroll-smooth">
            <body
                className={`${inter.variable} ${janeFont.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
            >
                {/* Header (Navbar) */}
                <main className="grow flex flex-col">{children}</main>
                {/* Footer */}
                <Toaster position="bottom-center" />
                <MobileFabs />
            </body>
        </html>
    );
}
