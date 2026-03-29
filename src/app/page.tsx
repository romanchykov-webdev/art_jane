import { ProductSequence } from '@/components/shared/canvas/product-sequence';

export default function Home() {
    return (
        <>
            {/* остается Server Components (RSC) */}
            <ProductSequence folderName="sequence" frameCount={174} />

            <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 py-24 bg-background">
                <h2 className="text-3xl font-semibold mb-12 tracking-tight">
                    Уникальные экземпляры
                </h2>
                {/* Здесь будет грид с товарами, получаемыми с сервера (Prisma) */}
            </section>
        </>
    );
}
