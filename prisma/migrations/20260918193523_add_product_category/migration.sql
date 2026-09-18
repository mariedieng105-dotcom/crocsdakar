-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('FEMME', 'HOMME', 'ENFANT', 'ACCESSOIRES', 'A_CLASSER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'A_CLASSER';

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
