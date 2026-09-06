-- Ремонтная миграция: приводит историю миграций в соответствие с реальным
-- состоянием базы.
--
-- Колонка Product.orderId создаётся в 0_init, но в живой базе её нет: связь
-- Product→Order заменили на OrderItem, а колонку удалили через `db push`
-- мимо истории миграций. Из-за этого воспроизведение истории давало схему,
-- отличную от schema.prisma, и `prisma migrate dev` требовал сброса базы.
--
-- Таблица OrderItem и таблица CheckoutLock в истории тоже отсутствуют —
-- обе создавались через `db push`.
--
-- В существующих окружениях эта миграция помечена применённой через
-- `prisma migrate resolve --applied` и НЕ выполняется: оба изменения там
-- уже присутствуют. На чистой базе она выполняется целиком.

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT IF EXISTS "Product_orderId_fkey";

-- DropColumn
ALTER TABLE "public"."Product" DROP COLUMN IF EXISTS "orderId";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceAtOrder" INTEGER NOT NULL,
    "titleAtOrder" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CheckoutLock" (
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutLock_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "CheckoutLock" ADD CONSTRAINT "CheckoutLock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
