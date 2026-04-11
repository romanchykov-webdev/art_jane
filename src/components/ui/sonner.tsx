'use client';

import {
    CircleCheck,
    Info,
    LoaderCircle,
    OctagonX,
    TriangleAlert,
} from 'lucide-react';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            position="top-center" // <-- Тосты всегда будут сверху
            icons={{
                success: <CircleCheck className="h-5 w-5" />,
                info: <Info className="h-5 w-5" />,
                warning: <TriangleAlert className="h-5 w-5" />,
                error: <OctagonX className="h-5 w-5" />,
                loading: <LoaderCircle className="h-5 w-5 animate-spin" />,
            }}
            toastOptions={{
                classNames: {
                    // Базовые классы
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-jane text-base',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',

                    // --- НАШИ КАСТОМНЫЕ ЦВЕТА ---
                    // Успех (Добавлено) - Зеленый
                    success:
                        'group-[.toaster]:!bg-emerald-500 group-[.toaster]:!text-white group-[.toaster]:!border-emerald-600',
                    // Ошибка/Удаление - Красный
                    error: 'group-[.toaster]:!bg-rose-500 group-[.toaster]:!text-white group-[.toaster]:!border-rose-600',
                    // Инфо - Синий или темное стекло
                    info: 'group-[.toaster]:!bg-blue-500 group-[.toaster]:!text-white group-[.toaster]:!border-blue-600',
                    // Предупреждение - Оранжевый
                    warning:
                        'group-[.toaster]:!bg-amber-500 group-[.toaster]:!text-white group-[.toaster]:!border-amber-600',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
