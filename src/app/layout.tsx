import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

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
                className={`${figtree.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
            >
                {/* Header (Navbar) */}
                <main className="flex-grow flex flex-col">{children}</main>
                {/*  Footer */}
            </body>
        </html>
    );
}
