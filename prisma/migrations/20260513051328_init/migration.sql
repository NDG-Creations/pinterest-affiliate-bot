-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('NEW', 'GENERATED', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT,
    "productTitle" TEXT NOT NULL,
    "productImageUrl" TEXT,
    "price" TEXT,
    "category" TEXT,
    "pinTitle" TEXT,
    "pinDescription" TEXT,
    "pinImageUrl" TEXT,
    "pinterestPinId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productUrl_key" ON "Product"("productUrl");
