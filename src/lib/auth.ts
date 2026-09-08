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
 * Подстановочные шаблоны вроде `*.vercel.app` сознательно не используются:
 * хост берётся из заголовка `x-forwarded-host`, то есть приходит из запроса,
 * и такой шаблон разрешил бы подставить ЛЮБОЙ чужой домен на vercel.app —
 * а вместе с ним и адреса редиректов после авторизации.
 */
const allowedHosts = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL, // постоянный домен прода
    process.env.VERCEL_URL, // домен конкретного деплоя
    process.env.VERCEL_BRANCH_URL, // домен ветки, …-git-<branch>-…
    'localhost:3000', // локальная разработка и смок-тесты Playwright
].filter((host): host is string => Boolean(host));

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
