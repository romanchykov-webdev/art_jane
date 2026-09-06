import { releaseExpiredReservations } from '@/lib/orders';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Воркер автоматического снятия протухшей брони.
 *
 * До его появления единственным источником освобождения товара был Stripe:
 * недоставленный вебхук навсегда оставлял вещь в статусе RESERVED, и на витрине
 * она числилась занятой. Теперь это подстраховано периодическим прогоном.
 *
 * Расписание задаётся в `vercel.json` (каждые 10 минут). На другом хостинге
 * роут можно дёргать любым внешним планировщиком или Supabase pg_cron —
 * важно лишь передавать заголовок `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error('[CRON_RELEASE] CRON_SECRET не задан в окружении');
        return NextResponse.json(
            { error: 'Cron is not configured' },
            { status: 500 }
        );
    }

    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await releaseExpiredReservations();

        if (result.releasedOrders > 0 || result.releasedProducts > 0) {
            console.info(
                `[CRON_RELEASE] Отменено заказов: ${result.releasedOrders}, ` +
                    `освобождено товаров-сирот: ${result.releasedProducts}`
            );
        }

        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('[CRON_RELEASE] Ошибка прогона воркера:', error);
        return NextResponse.json({ error: 'Sweep failed' }, { status: 500 });
    }
}
