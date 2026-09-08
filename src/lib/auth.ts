import { buildAllowedHosts } from '@/lib/auth-hosts';
import { prisma } from '@/lib/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

/**
 * Хосты, на которых приложению разрешено обслуживать авторизацию.
 *
 * Список собирается из системных переменных Vercel, а не прибивается к коду:
 * каждый превью-деплой получает собственный домен, и фиксированный адрес
 * означал бы, что на превью better-auth считает своим адресом продакшен,
 * выводит из него trustedOrigins и отклоняет запросы с превью-домена.
 *
 * Сама сборка живёт в `@/lib/auth-hosts` — там же запрет на подстановочные
 * шаблоны и тесты на него.
 */
const allowedHosts = buildAllowedHosts({
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
});

/**
 * Протокол задан явно, а не оставлен на `auto`.
 *
 * Имя cookie выбирается один раз при инициализации, и при динамическом
 * baseURL без явного протокола better-auth решал бы про префикс `__Secure-`
 * по NODE_ENV. Локальная сборка `next build && next start` тоже идёт с
 * NODE_ENV=production, из-за чего cookie на localhost вели бы себя иначе,
 * чем под `next dev`. С явным протоколом имя cookie совпадает с тем, что
 * приложение использовало до перехода на динамический baseURL, и уже
 * выданные сессии остаются в силе.
 */
const protocol = process.env.VERCEL ? ('https' as const) : ('http' as const);

export const auth = betterAuth({
    // Адрес вычисляется из хоста каждого запроса, поэтому один и тот же код
    // работает и на проде, и на любом превью-деплое, и локально.
    baseURL: {
        allowedHosts,
        protocol,
        // Если системные переменные почему-то не пришли, поведение
        // деградирует до прежнего фиксированного адреса, а не до отказа
        // в авторизации.
        ...(process.env.BETTER_AUTH_URL && {
            fallback: process.env.BETTER_AUTH_URL,
        }),
    },
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    // ВКЛЮЧАЕМ РЕГИСТРАЦИЮ И ЛОГИН ПО ПАРОЛЮ
    emailAndPassword: {
        enabled: true,
        autoSignIn: true, // Автоматически логинить после успешной регистрации
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});

export type Session = typeof auth.$Infer.Session;
