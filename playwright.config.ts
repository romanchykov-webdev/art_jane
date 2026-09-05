import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Спеки Playwright держим отдельно от src/: у vitest свой раннер, и в
    // vitest.config.ts этот каталог явно исключён.
    testDir: './e2e',

    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'html' : 'list',

    // Спред, а не `workers: undefined`: в tsconfig включён
    // exactOptionalPropertyTypes, при котором undefined в необязательное
    // поле передать нельзя — его нужно просто не указывать.
    ...(process.env.CI ? { workers: 1 } : {}),

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },

    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: {
        // Именно build + start, а не `next dev`: во-первых, это ближе к тому,
        // что увидит покупатель, во-вторых, CI больше нигде не запускает
        // `next build` — то есть смок заодно ловит поломку сборки.
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
