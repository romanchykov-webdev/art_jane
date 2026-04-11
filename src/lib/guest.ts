import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const GUEST_COOKIE_NAME = 'jane_guest_id';

export async function getOrCreateGuestId(): Promise<string> {
    const cookieStore = await cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);

    if (guestCookie?.value) {
        return guestCookie.value;
    }

    // Если гостя нет — генерируем новый UUID и ставим куку на 30 дней
    const newGuestId = uuidv4();

    cookieStore.set(GUEST_COOKIE_NAME, newGuestId, {
        httpOnly: true, // Защита от XSS (недоступно из document.cookie)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        path: '/',
    });

    return newGuestId;
}

export async function getGuestId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(GUEST_COOKIE_NAME)?.value || null;
}

export async function clearGuestId() {
    const cookieStore = await cookies();
    cookieStore.delete(GUEST_COOKIE_NAME);
}
// src/app/api/auth/[...all]/route.ts
