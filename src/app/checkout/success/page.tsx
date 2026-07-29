import { ButtonGoHome } from '@/components/shared/button-go-home';
import { ClearCartOnSuccess } from '@/components/shared/checkout/clear-cart-on-success';

interface PageProps {
    searchParams: Promise<{ session_id?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
    const { session_id } = await searchParams;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black">
            <ButtonGoHome />
            <h1 className="text-2xl font-jane tracking-wider mt-8">
                Спасибо за заказ!
            </h1>
            {session_id && (
                <p className="text-white/50 text-sm mt-2">
                    Сессия: {session_id}
                </p>
            )}
            <ClearCartOnSuccess />
        </div>
    );
}
