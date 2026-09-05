import { expect, test } from '@playwright/test';

/**
 * Смок-набор: проверяет, что приложение вообще поднимается и отдаёт ключевые
 * страницы. Здесь намеренно нет проверок бизнес-логики оплаты — платёжный
 * флоу покрыт юнит-тестами, а провести настоящий платёж в CI нельзя.
 *
 * Задача набора — ловить поломки, которые не видят ни tsc, ни сборка:
 * упавший рендер, необработанное исключение в серверном компоненте,
 * сломанный редирект.
 */

test('главная страница открывается', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Jane Art/i);
});

test('каталог открывается и показывает товары', async ({ page }) => {
    await page.goto('/shop');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Карточка товара — ссылка на /product/<slug>. Если каталог не отрендерился
    // или запрос к БД упал, ссылок не будет ни одной.
    const productLinks = page.locator('a[href^="/product/"]');
    await expect(productLinks.first()).toBeVisible();
});

test('карточка товара открывается из каталога', async ({ page }) => {
    await page.goto('/shop');

    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    await expect(page).toHaveURL(/\/product\/.+/);
    await expect(page.getByRole('heading').first()).toBeVisible();
});

test('гостя не пускают на оформление заказа', async ({ page }) => {
    // Гард в checkout/page.tsx: без сессии — редирект на главную. Без него
    // гость заполнил бы форму и упёрся в UNAUTHORIZED из server action.
    await page.goto('/checkout');

    await expect(page).toHaveURL('/');
});

test('несуществующая страница отдаёт 404', async ({ page }) => {
    const response = await page.goto('/stranica-kotoroy-net');

    expect(response?.status()).toBe(404);
});
