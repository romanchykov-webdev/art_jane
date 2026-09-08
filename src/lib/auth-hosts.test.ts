import { describe, expect, it, vi } from 'vitest';
import { LOCAL_DEV_HOST, buildAllowedHosts } from '@/lib/auth-hosts';

/**
 * Здесь проверяется решение, а не арифметика списка.
 *
 * Цена ошибки — подмена домена: better-auth берёт хост из заголовка
 * `x-forwarded-host`, то есть из запроса, и строит из него адрес, куда уйдёт
 * OAuth-редирект после авторизации. Поэтому главный тест в наборе — тот, что
 * запрещает подстановочные шаблоны.
 */
describe('buildAllowedHosts', () => {
    it('вне Vercel оставляет только локальный хост', () => {
        expect(buildAllowedHosts({})).toEqual([LOCAL_DEV_HOST]);
    });

    it('собирает все три домена Vercel и локальный', () => {
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: 'art-jane.vercel.app',
                VERCEL_URL: 'art-jane-abc123-team.vercel.app',
                VERCEL_BRANCH_URL: 'art-jane-git-main-team.vercel.app',
            })
        ).toEqual([
            'art-jane.vercel.app',
            'art-jane-abc123-team.vercel.app',
            'art-jane-git-main-team.vercel.app',
            LOCAL_DEV_HOST,
        ]);
    });

    it('НЕ пропускает подстановочные шаблоны', () => {
        // Ключевой тест набора. Шаблон `*.vercel.app` выглядит безобидным
        // упрощением и ничего не ломает на глаз, но разрешает подставить
        // любой чужой домен на vercel.app через x-forwarded-host.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const hosts = buildAllowedHosts({
            VERCEL_PROJECT_PRODUCTION_URL: '*.vercel.app',
            VERCEL_URL: 'preview-?.vercel.app',
        });

        expect(hosts).toEqual([LOCAL_DEV_HOST]);
        expect(warn).toHaveBeenCalledTimes(2);

        warn.mockRestore();
    });

    it('никогда не возвращает пустой список', () => {
        // better-auth бросает исключение на пустом allowedHosts, то есть
        // пустой список означал бы отказ в авторизации на всём приложении.
        expect(buildAllowedHosts({})).not.toHaveLength(0);
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: '',
                VERCEL_URL: '   ',
            })
        ).toEqual([LOCAL_DEV_HOST]);
    });

    it('отбрасывает пустые и пробельные значения', () => {
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: 'art-jane.vercel.app',
                VERCEL_URL: '',
                VERCEL_BRANCH_URL: '   ',
            })
        ).toEqual(['art-jane.vercel.app', LOCAL_DEV_HOST]);
    });

    it('убирает дубли', () => {
        // На продакшен-деплое домен деплоя и домен ветки могут совпасть.
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: 'art-jane.vercel.app',
                VERCEL_URL: 'art-jane.vercel.app',
                VERCEL_BRANCH_URL: 'art-jane.vercel.app',
            })
        ).toEqual(['art-jane.vercel.app', LOCAL_DEV_HOST]);
    });

    it('снимает протокол и путь, если они всё же пришли', () => {
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: 'https://art-jane.vercel.app',
                VERCEL_URL: 'http://art-jane-abc.vercel.app/api/auth',
            })
        ).toEqual([
            'art-jane.vercel.app',
            'art-jane-abc.vercel.app',
            LOCAL_DEV_HOST,
        ]);
    });

    it('всегда содержит локальный хост, даже на Vercel', () => {
        // Без него смок-тесты Playwright, которые поднимают сборку на
        // localhost, упирались бы в отказ авторизации.
        expect(
            buildAllowedHosts({
                VERCEL_PROJECT_PRODUCTION_URL: 'art-jane.vercel.app',
            })
        ).toContain(LOCAL_DEV_HOST);
    });
});
