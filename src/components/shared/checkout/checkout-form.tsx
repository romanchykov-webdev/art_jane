'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, InputHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { createCheckoutSession } from '@/actions/checkout';
import { useCheckoutStore } from '@/store/checkout';
import { useEffect, useState, useTransition } from 'react';

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
    const [serverError, setServerError] = useState<string | null>(null);

    // Берём сеттер флага оформления из общего стора
    const setCheckingOut = useCheckoutStore(s => s.setCheckingOut);
    const setFormValid = useCheckoutStore(s => s.setFormValid);

    const form = useForm<CustomerInfo>({
        resolver: zodResolver(customerInfoSchema),
        mode: 'onChange', //  onChange для мгновенной реакции кнопки
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

    // Синхронизация состояния валидности формы с внешним миром (CheckoutAside)
    useEffect(() => {
        setFormValid(isValid);
    }, [isValid, setFormValid]);

    // Сброс флагов при демонтаже
    useEffect(() => {
        return () => {
            setCheckingOut(false);
            setFormValid(false);
        };
    }, [setCheckingOut, setFormValid]);

    const onSubmit = (data: CustomerInfo) => {
        setServerError(null);
        // console.log('data', data);
        startTransition(async () => {
            try {
                const result = await createCheckoutSession(
                    data,
                    productIds,
                    expectedTotal
                );

                if (!result.ok) {
                    setServerError(result.message);
                    return;
                }

                window.location.href = result.url;
            } catch (err) {
                setServerError(
                    err instanceof Error ? err.message : 'Что-то пошло не так'
                );
            }
        });
    };

    return (
        <Form {...form}>
            {isPending && (
                <p className="text-amber-400 text-sm mb-4 animate-pulse">
                    Создаём заказ и переходим к оплате…
                </p>
            )}
            {serverError && (
                <p className="text-rose-400 text-sm mb-4">{serverError}</p>
            )}
            <form
                id="checkout-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <fieldset
                    disabled={isPending}
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
                                            // Перехватываем undefined
                                            onChange={val =>
                                                field.onChange(val || '')
                                            }
                                            className="flex w-full "
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
