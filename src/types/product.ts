import { ProductStatus } from '@/generated/prisma';

// 1. То, что приходит из БД (Prisma)
export interface ProductCardData {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: ProductStatus;
    thumbnailFront: string;
    thumbnailBack: string;
    size: string;
    favoriteCount: number;
    category?: {
        name: string;
    } | null;
}

// 2. То, что мы храним в Zustand
export type StoreProduct = Pick<
    ProductCardData,
    'id' | 'title' | 'price' | 'size' | 'thumbnailFront'
>;

// 3. Пропсы карточки
export interface ProductCardProps {
    product: ProductCardData;
    priority?: boolean;
}
