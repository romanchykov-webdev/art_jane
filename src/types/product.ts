import { ProductStatus } from '@/generated/prisma';

export interface ProductCardProps {
    product: {
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
        };
    };
    priority?: boolean;
}
