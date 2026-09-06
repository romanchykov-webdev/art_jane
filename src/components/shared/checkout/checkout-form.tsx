'use client';

import { createCheckoutSession } from '@/actions/checkout';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    customerInfoSchema,
    type CustomerInfo,
} from '@/lib/validations/checkout';
import { useCheckoutStore } from '@/store/checkout';
import { type CheckoutFailure } from '@/types/checkout';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    forwardRef,
    useEffect,
    useRef,
    useTransition,
    type FormEvent,
    type InputHTMLAttributes,
} from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Props {
    productIds: string[];
    initialUserDetails: Partial<CustomerInfo> | null;
    expectedTotal: number;
}

// Кастомный компонент для PhoneInput, чтобы он использовал стили shadcn
const CustomPhoneInput = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
    <Input
        {...props}
        ref={ref}
        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
    />
));
CustomPhoneInput.displayName = 'CustomPhoneInput';

export function CheckoutForm({
    productIds,
    initialUserDetails,
    expectedTotal,
}: Props) {
    const [isPending, startTransition] = useTransition();

    // Подписки на стор
    const setCheckingOut = useCheckoutStore(s => s.setCheckingOut);
    const setFormValid = useCheckoutStore(s => s.setFormValid);
    // ✅ ЕДИНООБРАЗНЫЙ ИСТОЧНИК ИСТИНЫ: Берем флаги напрямую из стора.
    // Локальный useState для isRedirecting оставлял кнопку сабмита слепой —
    // она читала стор, куда никто не писал, и надпись «Redirecting to Payment...»
    // не показывалась ни разу.
    const isCheckingOut = useCheckoutStore(s => s.isCheckingOut);
    const isRedirecting = useCheckoutStore(s => s.isRedirecting);
    const setRedirecting = useCheckoutStore(s => s.setRedirecting);

    // ⚡ Монотонный счётчик поколений: отбрасывает ответы старых запросов
    const requestIdRef = useRef(0);

    // 🔥 Синхронный лок: блокирует повторные клики до старта транзишена
    const submitLockRef = useRef(false);

    // 🛡️ WATCHDOG: Таймер на случай отмененной навигации на Stripe
    const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const form = useForm<CustomerInfo>({
        resolver: zodResolver(customerInfoSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: initialUserDetails?.firstName || '',
            lastName: initialUserDetails?.lastName || '',
            email: initialUserDetails?.email || '',
            phone: initialUserDetails?.phone || '',
            country: initialUserDetails?.country || '',
            city: initialUserDetails?.city || '',
            postalCode: initialUserDetails?.postalCode || '',
            street: initialUserDetails?.street || '',
            state: initialUserDetails?.state || '',
        },
    });

    const { isValid } = form.formState;

    // Синхронизация состояния загрузки
    useEffect(() => {
        setCheckingOut(isPending);
    }, [isPending, setCheckingOut]);

    // Синхронизация валидности формы со стором
    useEffect(() => {
        setFormValid(isValid);
    }, [isValid, setFormValid]);

    // ✅ Идемпотентный cleanup: зачищает таймеры и отменяет запросы в полёте
    useEffect(() => {
        return () => {
            requestIdRef.current += 1;
            submitLockRef.current = false;
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
            setCheckingOut(false);
            setFormValid(false);
            useCheckoutStore.getState().clearError();
        };
    }, [setCheckingOut, setFormValid]);

    // ЗАЩИТА ОТ BFCACHE (возврат по кнопке «Назад» из Stripe)
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (!event.persisted) return;

            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
            requestIdRef.current += 1;
            submitLockRef.current = false;
            setCheckingOut(false);
            // clearError() заодно снимает isRedirecting
            useCheckoutStore.getState().clearError();
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [setCheckingOut]);

    const onSubmit = (data: CustomerInfo) => {
        // Захватываем лок сразу после успешной валидации Zod
        if (submitLockRef.current) return;
        submitLockRef.current = true;

        useCheckoutStore.getState().clearError();

        const reqId = ++requestIdRef.current;

        startTransition(async () => {
            let isNavigating = false;

            try {
                const res = await createCheckoutSession(
                    data,
                    productIds,
                    expectedTotal
                );

                // Если поколение сменилось (был новый клик или анмаунт) — игнорируем
                if (reqId !== requestIdRef.current) return;

                if (!res.ok) {
                    useCheckoutStore.getState().setError(res);
                    return;
                }

                isNavigating = true;
                setRedirecting(true);

                // 🛡️ WATCHDOG START: Если за 12 сек страница не сменилась (Esc / AdBlock), снимаем лок
                redirectTimerRef.current = setTimeout(() => {
                    submitLockRef.current = false;
                    setRedirecting(false);
                    setCheckingOut(false);
                }, 12_000);

                window.location.assign(res.url);
            } catch (error) {
                const isStale = reqId !== requestIdRef.current;
                if (isStale) {
                    console.warn('[CHECKOUT_SUBMIT_ABORTED]', error);
                    return;
                }
                console.error('[CHECKOUT_SUBMIT_ERROR]', error);

                const failure: CheckoutFailure = {
                    ok: false,
                    code: 'INTERNAL_ERROR',
                    message: 'Ошибка сети. Проверьте подключение.',
                };
                useCheckoutStore.getState().setError(failure);
            } finally {
                // Если редирект не начался — сразу освобождаем лок
                if (!isNavigating) {
                    submitLockRef.current = false;
                }
            }
        });
    };

    // ✅ Блокируем форму по единому источнику истины из стора
    const isFormDisabled = isCheckingOut || isRedirecting;

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Пре-чек: отсекает лишние прогоны валидации во время запроса
        if (submitLockRef.current || isRedirecting) return;
        void form.handleSubmit(onSubmit)(e);
    };

    return (
        <Form {...form}>
            <form
                id="checkout-form"
                onSubmit={onFormSubmit}
                className="space-y-6"
            >
                <fieldset
                    disabled={isFormDisabled}
                    className="space-y-6 disabled:opacity-60"
                >
                    {/* БЛОК 1: Личные данные */}
                    <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2">
                        1. Contact Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        First Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Jane"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        Last Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Doe"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="jane@example.com"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        Phone Number
                                    </FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            international
                                            defaultCountry="IT"
                                            inputComponent={CustomPhoneInput}
                                            value={field.value}
                                            onChange={val =>
                                                field.onChange(val || '')
                                            }
                                            className="flex w-full"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* БЛОК 2: Адрес доставки */}
                    <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pt-4 pb-2">
                        2. Shipping Address
                    </h3>

                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white/70">
                                    Street Address, House/Apt Number
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Via Roma 12, App. 4"
                                        autoComplete="street-address"
                                        className="bg-white/5 border-white/20 text-white"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-rose-400" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        City
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Milano"
                                            autoComplete="address-level2"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        State / Region (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Lombardia"
                                            autoComplete="address-level1"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        Country
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Italy"
                                            autoComplete="country-name"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/70">
                                        Postal Code / ZIP
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="20121"
                                            autoComplete="postal-code"
                                            className="bg-white/5 border-white/20 text-white"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-rose-400" />
                                </FormItem>
                            )}
                        />
                    </div>
                </fieldset>
            </form>
        </Form>
    );
}
