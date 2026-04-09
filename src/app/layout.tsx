import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import './globals.css';

// fonts
import { janeFont } from '@/lib/fonts';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/shared/theme-provider';

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
        <html lang="ru" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${janeFont.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* Header (Navbar) */}
                    <main className="grow flex flex-col">{children}</main>
                    {/* Footer */}
                    <Toaster position="bottom-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
