import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import {
    OrderStatus,
    PrismaClient,
    ProductStatus,
} from '../src/generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Cleaning up database... 🗑️');
    // ДОБАВЛЕНО: Очистка новых таблиц
    await prisma.cartItem.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // ДОБАВЛЕНО: Создание тестового юзера
    console.log('Creating test user... 👤');
    const testUser = await prisma.user.create({
        data: {
            name: 'Serioga Romanchykov',

            email: 'serioga.genova@gmail.com',
            emailVerified: true,
        },
    });

    console.log('Seeding Categories... 🗂️');

    const categoriesData = [
        { name: 'T-shirts', slug: 't-shirts' },
        { name: 'Sweatshirts', slug: 'sweaters' },
        { name: 'Bags', slug: 'bags' },
        { name: 'Trousers', slug: 'pants' },
        { name: 'Jackets', slug: 'jackets' },
        { name: 'Costumes', slug: 'suits' },
    ];
    console.log('Database seeded with Categories! 🚀');

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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
            thumbnailBack:
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
            gallery: [
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_front.png',
                'https://nnmvfkxukiifiucgjdra.supabase.co/storage/v1/object/public/jane-art/shop/bags/nave/borsa_back.png',
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

    const createdProducts = [];
    for (let i = 0; i < products.length; i++) {
        const baseSlug = products[i].slug.replace(/-\d+$/, '');
        const created = await prisma.product.create({
            data: {
                ...products[i],
                slug: `${baseSlug}-${String(i + 1).padStart(2, '0')}`,
            },
        });
        createdProducts.push(created);
    }
    console.log('Database seeded with Products! 🚀');

    // ==========================================
    // ДОБАВЛЕНО: ГЕНЕРАЦИЯ ТЕСТОВЫХ СЦЕНАРИЕВ
    // ==========================================
    if (createdProducts.length >= 4) {
        console.log(
            'Setting up Test User Scenarios (Cart, Favorites, Orders)... 🧪'
        );

        // 1. Товар в Избранное
        await prisma.favorite.create({
            data: { userId: testUser.id, productId: createdProducts[0].id },
        });

        // 2. Товар в Корзину
        await prisma.cartItem.create({
            data: { userId: testUser.id, productId: createdProducts[1].id },
        });

        // 3. Успешный заказ (PAID) и смена статуса товара на SOLD
        await prisma.product.update({
            where: { id: createdProducts[2].id },
            data: { status: ProductStatus.SOLD },
        });
        await prisma.order.create({
            data: {
                userId: testUser.id,
                customerEmail: testUser.email,
                customerName: testUser.name,
                status: OrderStatus.PAID,
                items: { connect: [{ id: createdProducts[2].id }] },
            },
        });

        // 4. Заказ в ожидании (PENDING - Checkout Lock) и смена статуса на RESERVED
        await prisma.product.update({
            where: { id: createdProducts[3].id },
            data: { status: ProductStatus.RESERVED },
        });
        await prisma.order.create({
            data: {
                userId: testUser.id,
                customerEmail: testUser.email,
                customerName: testUser.name,
                status: OrderStatus.PENDING,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // + 15 минут
                items: { connect: [{ id: createdProducts[3].id }] },
            },
        });
    }

    console.log('Seeding Site Settings...');
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {},
        create: {
            id: 'global',
            heroSequenceFolder: 'sequence',
            heroSequenceFrameCount: 174,
        },
    });
    console.log('Site Settings seeded.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
