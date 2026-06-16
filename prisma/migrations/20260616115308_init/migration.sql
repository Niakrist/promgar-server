-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "content" TEXT,
    "brand" TEXT,
    "bodyRolling" TEXT,
    "loadDirection" TEXT,
    "rowCount" TEXT,
    "bearingType" TEXT,
    "inner_diameter_mm" DOUBLE PRECISION,
    "outer_diameter_mm" DOUBLE PRECISION,
    "width_mm" DOUBLE PRECISION,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUrl" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "isCanonical" BOOLEAN NOT NULL DEFAULT false,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_inner_diameter_mm_outer_diameter_mm_width_mm_idx" ON "Product"("inner_diameter_mm", "outer_diameter_mm", "width_mm");

-- CreateIndex
CREATE INDEX "Product_brand_bodyRolling_loadDirection_rowCount_bearingTyp_idx" ON "Product"("brand", "bodyRolling", "loadDirection", "rowCount", "bearingType");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUrl_path_key" ON "ProductUrl"("path");

-- CreateIndex
CREATE INDEX "ProductUrl_path_idx" ON "ProductUrl"("path");

-- AddForeignKey
ALTER TABLE "ProductUrl" ADD CONSTRAINT "ProductUrl_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
