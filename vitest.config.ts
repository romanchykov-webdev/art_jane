import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    // Без этого плагина vitest не резолвит алиас `@/*` из tsconfig.json,
    // которым пользуется весь код приложения.
    plugins: [tsconfigPaths()],
    test: {
        environment: 'node',

        // e2e/ — спеки Playwright с собственным раннером. Без исключения
        // vitest попытается выполнить их своим и упадёт на импорте
        // @playwright/test.
        exclude: ['**/node_modules/**', 'e2e/**'],

        env: {
            // `src/lib/stripe.ts` создаёт клиент на уровне модуля:
            // `new Stripe(process.env.STRIPE_SECRET_KEY!)` синхронно бросает
            // без ключа. Без заглушки падал бы сам импорт файла, а не
            // отдельный тест — с невнятным сообщением.
            STRIPE_SECRET_KEY: 'sk_test_vitest_dummy_key',
        },
    },
});
