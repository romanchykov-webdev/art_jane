import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient, ProductStatus } from '../src/generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Cleaning up database... 🗑️');
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('Seeding Categories... 🗂️');

    const categoriesData = [
        { name: 'Футболки', slug: 't-shirts' },
        { name: 'Кофты', slug: 'sweaters' },
        { name: 'Сумки', slug: 'bags' },
        { name: 'Штаны', slug: 'pants' },
        { name: 'Куртки', slug: 'jackets' },
        { name: 'Костюмы', slug: 'suits' },
    ];

    const createdCategories: Record<string, string> = {};
    for (const cat of categoriesData) {
        const created = await prisma.category.create({ data: cat });
        createdCategories[cat.slug] = created.id;
    }

    console.log('Seeding real art pieces with Categories and Galleries... 🎨');

    const products = [
        // sweaters
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        {
            title: "Longsleeve 'Il Mio Mondo'",
            slug: 'longsleeve-il-mio-mondo-01',
            description:
                "Уникальный лонгслив белого цвета с ручной росписью черно-белым акрилом. На лицевой стороне — портрет девушки в стиле гранж. Текст 'IL MIO MONDO NON È PER TUTTI'. На спине — 'SONO LIBERA DAI VOSTRI SGUARDI'.",
            price: 15000,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/woman/woman_front.webp',
            ],
            size: 'M (Unisex)',
            materials: '100% Хлопок, Акрил по текстилю',
            sequenceFolder: 'woman-longsleeve',
            sequenceFrameCount: 174,
            categoryId: createdCategories['sweaters'],
        },
        // t-shirts
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['t-shirts'],
        },
        // bags
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['bags'],
        },
        // pants
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['pants'],
        },
        // jackets
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['jackets'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['jackets'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['jackets'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['jackets'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['jackets'],
        },
        // suits
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['suits'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['suits'],
        },
        {
            title: "Distressed T-Shirt 'Guardian Cat'",
            slug: 'distressed-t-shirt-guardian-cat-02',
            description:
                "Кастомная серая футболка с эффектом состаривания. Портрет пушистого кота. На спине: 'Try petting it... if you survive, give it a like'.",
            price: 12500,
            status: ProductStatus.AVAILABLE,
            thumbnailFront:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_back.webp',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/cat/cat_front.webp',
            ],
            size: 'L (Oversize)',
            materials: 'Варёный хлопок, Текстильные маркеры',
            sequenceFolder: 'cat-tshirt',
            sequenceFrameCount: 174,
            categoryId: createdCategories['suits'],
        },
    ];

    for (let i = 0; i < products.length; i++) {
        const baseSlug = products[i].slug.replace(/-\d+$/, '');
        await prisma.product.create({
            data: {
                ...products[i],
                slug: `${baseSlug}-${String(i + 1).padStart(2, '0')}`,
            },
        });
    }

    console.log('Database seeded with Categories! 🚀');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
