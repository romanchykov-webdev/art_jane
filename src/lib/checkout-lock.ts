import { prisma } from '@/lib/prisma';

/**
 * TTL мьютекса оформления заказа.
 *
 * Расчёт по худшему случаю защищённой секции:
 *   GC-retrieve к Stripe (≤15с) + транзакция бронирования (timeout 10с,
 *   maxWait 5с → ≤15с) + sessions.create (≤20с) + дозапись stripeSessionId
 *   (доли секунды) ≈ 50с.
 *
 * 90с даёт запас ×1.8 на сетевой джиттер и cold start, но при этом не
 * подвешивает повторную попытку пользователя дольше полутора минут,
 * если процесс умер с захваченным локом.
 */
export const CHECKOUT_LOCK_TTL_MS = 90_000;

/**
 * Пытается захватить лок оформления заказа для пользователя.
 *
 * Одним атомарным INSERT ... ON CONFLICT: если живого лока нет — строка
 * создаётся; если есть, но протух — перехватывается; если есть и живой —
 * условие WHERE не выполняется, строка не возвращается, лок не наш.
 *
 * Время берём из БД (`now()`), а не из приложения: при нескольких инстансах
 * расхождение часов не должно влиять на то, кто владеет локом. Приведение
 * к UTC обязательно — колонка объявлена как `timestamp without time zone`,
 * и Prisma пишет в неё UTC, тогда как голый `now()` отдал бы время в
 * таймзоне сессии.
 *
 * @returns `true`, если лок захвачен именно этим вызовом.
 */
export async function acquireCheckoutLock(
    userId: string,
    token: string
): Promise<boolean> {
    const expiresAt = new Date(Date.now() + CHECKOUT_LOCK_TTL_MS);

    const rows = await prisma.$queryRaw<{ userId: string }[]>`
        INSERT INTO "CheckoutLock" ("userId", "token", "expiresAt")
        VALUES (${userId}, ${token}, ${expiresAt})
        ON CONFLICT ("userId") DO UPDATE
            SET "token" = EXCLUDED."token",
                "expiresAt" = EXCLUDED."expiresAt"
            WHERE "CheckoutLock"."expiresAt" < (now() AT TIME ZONE 'UTC')
        RETURNING "userId"
    `;

    return rows.length > 0;
}

/**
 * Снимает лок — но только если он всё ещё наш.
 *
 * Сверка token обязательна: если наш лок протух по TTL и его перехватил
 * следующий запрос, безусловный DELETE снял бы ЧУЖОЙ активный лок и пустил
 * бы третий запрос в защищённую секцию параллельно со вторым.
 */
export async function releaseCheckoutLock(
    userId: string,
    token: string
): Promise<void> {
    await prisma.$executeRaw`
        DELETE FROM "CheckoutLock"
        WHERE "userId" = ${userId} AND "token" = ${token}
    `;
}
