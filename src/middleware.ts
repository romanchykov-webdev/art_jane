import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Создаем базовый ответ, который позволяет запросу идти дальше
    const response = NextResponse.next();

    // 2. Проверяем наличие гостевого бейджика (куки)
    const guestId = request.cookies.get('jane_guest_id')?.value;

    // 3. Если гость пришел впервые — выдаем ему бейджик
    if (!guestId) {
        const newGuestId = crypto.randomUUID(); // Нативный, сверхбыстрый генератор UUID

        response.cookies.set({
            name: 'jane_guest_id',
            value: newGuestId,
            httpOnly: true, // Защита от XSS: JS в браузере не сможет украсть эту куку
            secure: process.env.NODE_ENV === 'production', // Передавать только по HTTPS на проде
            sameSite: 'lax', // Защита от CSRF
            path: '/', // Кука доступна на всех страницах сайта
            maxAge: 60 * 60 * 24 * 30, // Срок годности: 30 дней
        });
    }

    return response;
}

// 4. Оптимизация: указываем, где Middleware НЕ должен работать
export const config = {
    matcher: [
        /*
         * Игнорируем запросы к:
         * - api (наши эндпоинты)
         * - _next/static (статичные файлы)
         * - _next/image (оптимизатор картинок)
         * - favicon.ico и любые картинки (svg, png, jpg, jpeg, gif, webp)
         * Зачем тратить ресурсы сервера на выдачу куки картинке? :)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
