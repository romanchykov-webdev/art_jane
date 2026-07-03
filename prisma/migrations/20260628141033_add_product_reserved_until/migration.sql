-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "reservedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Product_status_reservedUntil_idx" ON "Product"("status", "reservedUntil");
