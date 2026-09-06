'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCheckoutStore } from '@/store/checkout';
import { type CheckoutErrorCode } from '@/types/checkout';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition, type ReactNode } from 'react';
import { AuthDialog } from '../auth/auth-dialog';

interface Props {
    items: { id: string; title: string }[];
}

/**
 * Коды, при которых модалку нельзя закрыть кликом мимо: оформление всё равно
 * не поедет дальше, пока проблема не решена. UNAUTHORIZED здесь ещё и потому,
 * что внутри открывается вложенный диалог входа — без этого клик по нему
 * считался бы «кликом снаружи» и схлопывал бы оба окна разом.
 */
const CRITICAL_CODES: readonly CheckoutErrorCode[] = [
    'PRODUCT_UNAVAILABLE',
    'CART_CHANGED',
    'EMPTY_CART',
    'UNAUTHORIZED',
];

/**
 * Раньше кнопка «Войти» вызывала только clearError() — модалка закрывалась,
 * а войти было негде, и сабмит падал бесконечно. Теперь она открывает штатный
 * диалог авторизации; «На главную» оставляет выход тем, кто входить не хочет.
 */
function UnauthorizedFooter() {
    return (
        <>
            <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
                На главную
            </Link>
            <AuthDialog>
                <Button variant="destructive">Войти</Button>
            </AuthDialog>
        </>
    );
}

export function CheckoutErrorDialog({ items }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pendingRefreshRef = useRef(false);

    const error = useCheckoutStore(s => s.error);
    const isErrorModalOpen = useCheckoutStore(s => s.isErrorModalOpen);
    const closeErrorModal = useCheckoutStore(s => s.closeErrorModal);
    const clearError = useCheckoutStore(s => s.clearError);

    // ✅ Сбрасываем ошибку ПОСЛЕ завершения router.refresh()
    useEffect(() => {
        if (isPending || !pendingRefreshRef.current) return;
        pendingRefreshRef.current = false;
        clearError();
    }, [isPending, clearError]);

    if (!error) return null;

    const isCritical = CRITICAL_CODES.includes(error.code);

    const handleInteractOutside = (e: Event) => {
        if (isCritical) e.preventDefault();
    };

    // ✅ Оживляем useTransition: держим модалку открытой со спиннером, пока Next.js обновляет данные
    const handleRefresh = () => {
        pendingRefreshRef.current = true;
        startTransition(() => {
            router.refresh();
        });
    };

    const renderContent = (): {
        title: string;
        desc: ReactNode;
        action?: () => void;
        btnText?: string;
    } => {
        switch (error.code) {
            case 'PRODUCT_UNAVAILABLE': {
                const blocked = error.unavailableProducts ?? [];

                if (blocked.length > 0) {
                    const titleById = new Map(
                        items.map(item => [item.id, item.title])
                    );
                    const named = blocked
                        .map(entry => ({
                            title: titleById.get(entry.id),
                            reason: entry.reason,
                        }))
                        .filter(
                            (
                                entry
                            ): entry is {
                                title: string;
                                reason: typeof entry.reason;
                            } => Boolean(entry.title)
                        );

                    return {
                        title: 'Некоторые товары недоступны',
                        desc: (
                            <div className="space-y-2">
                                {named.length > 0 ? (
                                    <ul className="list-disc pl-5 text-white/90 font-medium space-y-1">
                                        {named.map(entry => (
                                            <li key={entry.title}>
                                                {entry.title}
                                                <span className="block text-xs font-normal text-white/50">
                                                    {entry.reason === 'SOLD'
                                                        ? 'продан — вещь существует в единственном экземпляре'
                                                        : 'забронирован другим покупателем, бронь освободится в течение 40 минут'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-white/60">
                                        (Товары из корзины обновлены)
                                    </p>
                                )}
                                <p>
                                    Удалите их из корзины, чтобы оплатить
                                    остальное.
                                </p>
                            </div>
                        ),
                        action: closeErrorModal,
                        btnText: 'Понятно',
                    };
                }

                return {
                    title: 'Состав каталога изменился',
                    desc: 'Некоторые товары из вашей корзины больше не доступны. Давайте обновим страницу.',
                    action: handleRefresh,
                    btnText: 'Обновить страницу',
                };
            }
            case 'CART_CHANGED':
            case 'EMPTY_CART':
                return {
                    title: 'Корзина изменилась',
                    desc: 'Цена или состав вашей корзины изменились (возможно, в другой вкладке). Давайте обновим данные.',
                    action: handleRefresh,
                    btnText: 'Обновить страницу',
                };
            case 'UNAUTHORIZED':
                return {
                    title: 'Время сессии истекло',
                    desc: 'Пожалуйста, войдите в аккаунт заново, чтобы продолжить оформление. Данные формы сохранятся.',
                };
            case 'PROCESSING_ERROR':
                return {
                    title: 'Заказ обрабатывается',
                    desc: error.message,
                    action: handleRefresh,
                    btnText: 'Проверить статус',
                };
            default:
                return {
                    title: 'Произошла ошибка',
                    desc: (
                        <div className="space-y-2">
                            <p>{error.message}</p>
                            {error.errorId && (
                                <p className="text-xs text-white/40">
                                    ID ошибки: {error.errorId}
                                </p>
                            )}
                        </div>
                    ),
                    action: clearError,
                    btnText: 'Понятно',
                };
        }
    };

    const content = renderContent();

    return (
        <Dialog
            open={isErrorModalOpen}
            onOpenChange={open => {
                if (!open && !isCritical) clearError();
            }}
        >
            <DialogContent
                onInteractOutside={handleInteractOutside}
                onEscapeKeyDown={handleInteractOutside}
                className={cn(
                    'sm:max-w-md bg-zinc-900 border-zinc-800 text-white',
                    isCritical && '[&>button]:hidden'
                )}
            >
                <DialogHeader>
                    <DialogTitle
                        className={cn(
                            'flex items-center gap-2',
                            isCritical ? 'text-rose-500' : 'text-amber-500'
                        )}
                    >
                        {isCritical ? (
                            <AlertTriangle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        {content.title}
                    </DialogTitle>
                    {/* Radix Slot обернут в единственный div для гарантированного предотвращения ошибок гидратации */}
                    <DialogDescription asChild>
                        <div className="text-zinc-400 pt-2 text-sm font-normal">
                            {content.desc}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end mt-4 gap-2">
                    {error.code === 'UNAUTHORIZED' ? (
                        <UnauthorizedFooter />
                    ) : (
                        <Button
                            variant={isCritical ? 'destructive' : 'secondary'}
                            onClick={content.action}
                            disabled={isPending}
                        >
                            {isPending ? 'Загрузка...' : content.btnText}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
