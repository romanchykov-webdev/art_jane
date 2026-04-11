import { prisma } from '@/lib/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
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
