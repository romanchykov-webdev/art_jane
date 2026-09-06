'use server';

import { auth } from '@/lib/auth';
import { getOrCreateGuestId } from '@/lib/guest';
import { mapToStoreProduct } from '@/lib/mappers';
import { prisma } from '@/lib/prisma';
import { StoreProduct } from '@/types/product';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

interface NextDynamicError extends Error {
    digest?: string;
}

/**
 * Type guard для определения системных ошибок Next.js (например, redirect или notFound).
 * Необходимо для того, чтобы блок catch не проглатывал прерывания фреймворка,
 * иначе навигация и динамический рендеринг сломаются.
 */
function isNextDynamicError(error: unknown): error is NextDynamicError {
    return error instanceof Error && 'digest' in error;
}

/**
 * Определяет текущую личность пользователя (Identity) для взаимодействия с БД.
 * Сначала пытается получить авторизованную сессию. Если пользователь анонимен,
 * извлекает (или создает новую) cookie с guestId.
 * * @returns Объект, содержащий либо `userId` (для авторизованных), либо `guestId` (для гостей).
 */
async function getIdentity() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) return { userId: session.user.id, guestId: null };
    const guestId = await getOrCreateGuestId();
    return { userId: null, guestId };
}

/**
 * Server Action для переключения статуса товара в "Избранном".
 * Автоматически связывает товар либо с аккаунтом пользователя, либо с сессией гостя.
 * Поддерживает как явные команды (добавить/удалить), так и поведение "toggle".
 *
 * @param productId - Идентификатор целевого товара.
 * @param intent - Опционально: 'add' (принудительно добавить) или 'remove' (принудительно удалить).
 * @returns Объект с результатом операции и итоговым состоянием ('added' | 'removed').
 */
export async function toggleFavoriteAction(
    productId: string,
    intent?: 'add' | 'remove'
) {
    try {
        const { userId, guestId } = await getIdentity();
        const uniqueWhere = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.favorite.findUnique({
            where: uniqueWhere,
        });
        let operation: 'create' | 'delete' | 'none' = 'none';

        if (intent === 'remove') operation = existing ? 'delete' : 'none';
        else if (intent === 'add') operation = !existing ? 'create' : 'none';
        else operation = existing ? 'delete' : 'create';

        if (operation === 'delete') {
            const deleteWhere = userId
                ? { productId, userId }
                : { productId, guestId: guestId! };
            await prisma.favorite.deleteMany({ where: deleteWhere });
        } else if (operation === 'create') {
            await prisma.favorite.create({
                data: { productId, userId, guestId },
            });
        }

        if (operation !== 'none') revalidatePath('/profile');

        const finalState =
            operation === 'delete' || (intent === 'remove' && !existing)
                ? 'removed'
                : 'added';
        return { success: true, action: finalState };
    } catch (error: unknown) {
        if (isNextDynamicError(error)) {
            if (
                error.digest === 'DYNAMIC_SERVER_USAGE' ||
                error.digest?.includes('NEXT_REDIRECT')
            ) {
                throw error;
            }
        }

        console.error(
            '[TOGGLE_FAVORITE_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { success: false, error: 'Failed to sync' };
    }
}

/**
 * Server Action для добавления или удаления товара из Корзины.
 * Логика работы с Identity и вычисление intent идентичны функции toggleFavoriteAction,
 * но мутации происходят в таблице CartItem.
 *
 * @param productId - Идентификатор целевого товара.
 * @param intent - Опционально: 'add' (принудительно добавить) или 'remove' (принудительно удалить).
 * @returns Объект с результатом операции и итоговым состоянием ('added' | 'removed').
 */
export async function toggleCartAction(
    productId: string,
    intent?: 'add' | 'remove'
) {
    try {
        const { userId, guestId } = await getIdentity();
        const uniqueWhere = userId
            ? { productId_userId: { productId, userId } }
            : { productId_guestId: { productId, guestId: guestId! } };

        const existing = await prisma.cartItem.findUnique({
            where: uniqueWhere,
        });
        let operation: 'create' | 'delete' | 'none' = 'none';

        if (intent === 'remove') operation = existing ? 'delete' : 'none';
        else if (intent === 'add') operation = !existing ? 'create' : 'none';
        else operation = existing ? 'delete' : 'create';

        if (operation === 'delete') {
            const deleteWhere = userId
                ? { productId, userId }
                : { productId, guestId: guestId! };
            await prisma.cartItem.deleteMany({ where: deleteWhere });
        } else if (operation === 'create') {
            await prisma.cartItem.create({
                data: { productId, userId, guestId },
            });
        }

        // if (operation !== 'none') revalidatePath('/profile');
        if (operation !== 'none') {
            revalidatePath('/', 'layout');
        }

        const finalState =
            operation === 'delete' || (intent === 'remove' && !existing)
                ? 'removed'
                : 'added';
        return { success: true, action: finalState };
    } catch (error: unknown) {
        if (isNextDynamicError(error)) {
            if (
                error.digest === 'DYNAMIC_SERVER_USAGE' ||
                error.digest?.includes('NEXT_REDIRECT')
            ) {
                throw error;
            }
        }

        console.error(
            '[TOGGLE_CART_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { success: false, error: 'Failed to sync' };
    }
}

/**
 * Server Action для первоначальной загрузки глобального состояния магазина пользователя.
 * Извлекает все товары из корзины и избранного параллельными запросами для оптимизации.
 * Возвращаемые данные мапятся в единый DTO (StoreProduct) перед отправкой на клиент.
 *
 * @returns Объект с двумя массивами: `cart` (сортировка по добавлению) и `favorites` (сначала новые).
 */
export async function getShopState(): Promise<{
    cart: StoreProduct[];
    favorites: StoreProduct[];
}> {
    try {
        const { userId, guestId } = await getIdentity();
        const whereClause = userId ? { userId } : { guestId: guestId! };

        const [cartData, favoritesData] = await Promise.all([
            prisma.cartItem.findMany({
                where: whereClause,
                include: { product: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.favorite.findMany({
                where: whereClause,
                include: { product: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            cart: cartData.map(mapToStoreProduct),
            favorites: favoritesData.map(mapToStoreProduct),
        };
    } catch (error: unknown) {
        if (isNextDynamicError(error)) {
            if (
                error.digest === 'DYNAMIC_SERVER_USAGE' ||
                error.digest?.includes('NEXT_REDIRECT')
            ) {
                throw error;
            }
        }

        console.error(
            '[GET_SHOP_STATE_ERROR]',
            error instanceof Error ? error.message : String(error)
        );
        return { cart: [], favorites: [] };
    }
}

//Пакетное удаление из БД
// Теперь, когда модалка всплывет и скажет "Картины А и Б проданы",
// по клику на кнопку "Удалить" мы должны удалить оба товара за один запрос.
// Если делать это поштучно, Next.js сойдет с ума от
// ревалидаций, и страница будет дико дергаться.
export async function removeCartItemsAction(productIds: string[]) {
    try {
        if (!productIds || productIds.length === 0) {
            return { success: true, removed: 0 };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;

        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Выполняем массовое удаление атомарно (за 1 запрос в БД)
        const result = await prisma.cartItem.deleteMany({
            where: {
                userId,
                productId: { in: productIds },
            },
        });

        // Ревалидируем весь layout, чтобы и страница чекаута, и хедер обновились
        revalidatePath('/', 'layout');

        return { success: true, removed: result.count };
    } catch (error) {
        console.error('[REMOVE_CART_ITEMS_ERROR]', error);
        return { success: false, error: 'Failed to remove items' };
    }
}
