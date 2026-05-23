import { Product } from '@/generated/prisma';
import { StoreProduct } from '@/types/product';

/**
 * Трансформирует вложенный объект Prisma в легкий клиентский интерфейс.
 * Используется строго для безопасной передачи данных из серверных компонентов/экшенов в Zustand.
 */
export function mapToStoreProduct(item: { product: Product }): StoreProduct {
    return {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        status: item.product.status, //Защита от гонки данных
        price: item.product.price,
        size: item.product.size,
        thumbnailFront: item.product.thumbnailFront,
    };
}
