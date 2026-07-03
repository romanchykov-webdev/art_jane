import Link from 'next/link';

export default function Page() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-4 text-center">
            <h1 className="text-3xl font-jane tracking-wider mb-4">
                Оплата отменена
            </h1>

            <p className="text-white/60 max-w-md mb-8">
                Платёж не был завершён. Ваши товары пока зарезервированы — вы
                можете вернуться и попробовать оформить заказ снова.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/checkout"
                    className="h-12 px-8 inline-flex items-center justify-center rounded-full font-jane text-sm tracking-widest bg-amber-500 text-black hover:bg-amber-600 transition-colors"
                >
                    ВЕРНУТЬСЯ К ОПЛАТЕ
                </Link>

                <Link
                    href="/"
                    className="h-12 px-8 inline-flex items-center justify-center rounded-full font-jane text-sm tracking-widest border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                    НА ГЛАВНУЮ
                </Link>
            </div>
        </div>
    );
}
