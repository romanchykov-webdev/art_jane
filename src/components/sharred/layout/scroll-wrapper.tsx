import { ReactNode } from 'react';

interface ScrollWrapperProps {
    children: ReactNode;
    /** Высота скролл-трека. Определяет, как долго будет длиться анимация. Например: '300vh' */
    trackHeight?: string;
}

export const ScrollWrapper = ({
    children,
    trackHeight = '300vh',
}: ScrollWrapperProps) => {
    return (
        <section style={{ height: trackHeight }} className="relative w-full">
            {/* Sticky-контейнер */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                {/* Контентный ограничитель для резины */}
                <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 h-full relative">
                    {children}
                </div>
            </div>
        </section>
    );
};
