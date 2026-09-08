/**
 * Сборка списка хостов, на которых приложению разрешено обслуживать
 * авторизацию.
 *
 * Вынесено из `src/lib/auth.ts` отдельным модулем ради тестируемости: импорт
 * `auth.ts` тянет за собой Prisma и инициализацию better-auth, поэтому
 * проверить одну лишь логику списка через него нельзя.
 */

/** Хост локальной разработки и смок-тестов Playwright. */
export const LOCAL_DEV_HOST = 'localhost:3000';

/**
 * Системные переменные Vercel, из которых собирается список.
 * Приходят автоматически, задавать их вручную не нужно.
 */
export interface VercelHostEnv {
    /** Постоянный домен продакшена, например `art-jane.vercel.app`. */
    VERCEL_PROJECT_PRODUCTION_URL?: string | undefined;
    /** Домен конкретного деплоя, свой у каждой сборки. */
    VERCEL_URL?: string | undefined;
    /** Домен ветки, вида `…-git-<branch>-…vercel.app`. */
    VERCEL_BRANCH_URL?: string | undefined;
}

/**
 * Приводит значение к голому хосту: убирает протокол, путь и пробелы.
 * Vercel отдаёт хосты и так без протокола — снятие сделано на случай, если
 * значение однажды придёт из другого источника.
 */
function normalizeHost(value: string | undefined): string | null {
    if (!value) return null;

    const host = value
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');

    return host.length > 0 ? host : null;
}

/**
 * Возвращает список разрешённых хостов без дублей и без подстановочных
 * шаблонов.
 *
 * Подстановки отбрасываются намеренно и это главное, что здесь защищается.
 * Хост берётся из заголовка `x-forwarded-host`, то есть приходит из запроса,
 * поэтому шаблон вроде `*.vercel.app` разрешил бы подставить ЛЮБОЙ чужой
 * домен на vercel.app — а вместе с ним и адрес, куда уйдёт OAuth-редирект
 * после авторизации. Соблазн «упростить» список до одного шаблона выглядит
 * безобидно и ничего не ломает на глаз, поэтому запрет живёт в коде, а не
 * только в комментарии.
 *
 * Список никогда не бывает пустым: `LOCAL_DEV_HOST` добавляется всегда, а
 * better-auth бросает исключение на пустом `allowedHosts`.
 */
export function buildAllowedHosts(env: VercelHostEnv): string[] {
    const candidates = [
        env.VERCEL_PROJECT_PRODUCTION_URL,
        env.VERCEL_URL,
        env.VERCEL_BRANCH_URL,
        LOCAL_DEV_HOST,
    ];

    const hosts: string[] = [];

    for (const candidate of candidates) {
        const host = normalizeHost(candidate);

        if (!host) continue;

        if (host.includes('*') || host.includes('?')) {
            console.warn(
                `[AUTH_HOSTS] Хост с подстановкой отброшен: ${host}. ` +
                    'Подстановки разрешили бы подменить домен через заголовок x-forwarded-host.'
            );
            continue;
        }

        if (!hosts.includes(host)) hosts.push(host);
    }

    return hosts;
}
