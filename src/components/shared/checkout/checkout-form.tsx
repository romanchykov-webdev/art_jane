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

export function CheckoutForm() {
    const form = useForm<CustomerInfo>({
        resolver: zodResolver(customerInfoSchema),
        mode: 'onBlur',
        defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
    });

    const onSubmit = (data: CustomerInfo) => {
        //TODO: Здесь позже будет вызов Server Action STRIPE CHECKOUT
        console.log('Готово к отправке в Stripe:', data);
    };

    return (
        <Form {...form}>
            {/* id нужен, чтобы сабмитить форму кнопкой из правой колонки */}
            <form
                id="checkout-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
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
                                    onChange={field.onChange}
                                    className="flex w-full"
                                />
                            </FormControl>
                            <FormMessage className="text-rose-400" />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
