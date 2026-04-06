import { ProductStatus } from '@/generated/prisma';

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
    } | null; // Prisma может вернуть null для связей, TS требует строгости
}

// 2. пропсах карточки
export interface ProductCardProps {
    product: ProductCardData;
    priority?: boolean;
}
