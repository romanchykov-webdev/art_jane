import { createAuthClient } from 'better-auth/react';

// Эта функция автоматически подхватит URL сервера из окружения
export const authClient = createAuthClient({
    // baseURL необязателен, если фронт и бэк на одном домене,
    // но для надежности лучше указать
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Экспортируем готовые хуки и методы для удобства
export const { signIn, signOut, signUp, useSession } = authClient;
