import { ScrollWrapper } from '@/components/sharred/layout/scroll-wrapper';

export default function Home() {
    return (
        <>
            {/* Первый блок: Скролл-анимация */}
            <ScrollWrapper trackHeight="400vh">
                <div className="flex flex-col items-center justify-center h-full z-10 relative">
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter text-center mb-8">
                        Искусство, которое <br /> можно носить
                    </h1>
                    {/* <CanvasSequence /> */}
                    <div className="absolute inset-0 z-[-1] border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400">
                        [Canvas с одеждой]
                    </div>
                </div>
            </ScrollWrapper>

            {/* Второй блок: Обычный контент (Сетка товаров) */}
            <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 py-24">
                <h2 className="text-3xl font-semibold mb-12">
                    Уникальные экземпляры
                </h2>
                {/* Grid с карточками товаров */}
            </section>
        </>
    );
}
