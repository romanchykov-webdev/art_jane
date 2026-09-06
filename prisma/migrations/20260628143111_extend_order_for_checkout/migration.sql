-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_guestId_idx" ON "Order"("guestId");

-- CreateIndex
CREATE INDEX "Order_status_expiresAt_idx" ON "Order"("status", "expiresAt");
