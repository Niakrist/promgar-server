/*
  Warnings:

  - You are about to drop the column `bearingType` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `bodyRolling` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `loadDirection` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rowCount` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_brand_bodyRolling_loadDirection_rowCount_bearingTyp_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "bearingType",
DROP COLUMN "bodyRolling",
DROP COLUMN "brand",
DROP COLUMN "loadDirection",
DROP COLUMN "rowCount",
ADD COLUMN     "bearing_type_id" INTEGER,
ADD COLUMN     "brand_id" INTEGER,
ADD COLUMN     "load_direction_id" INTEGER,
ADD COLUMN     "rolling_body_id" INTEGER,
ADD COLUMN     "row_count_id" INTEGER,
ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollingBody" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RollingBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadDirection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LoadDirection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RowCount" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RowCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BearingType" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BearingType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RollingBody_slug_key" ON "RollingBody"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LoadDirection_slug_key" ON "LoadDirection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RowCount_slug_key" ON "RowCount"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BearingType_slug_key" ON "BearingType"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_rolling_body_id_fkey" FOREIGN KEY ("rolling_body_id") REFERENCES "RollingBody"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_load_direction_id_fkey" FOREIGN KEY ("load_direction_id") REFERENCES "LoadDirection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_row_count_id_fkey" FOREIGN KEY ("row_count_id") REFERENCES "RowCount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_bearing_type_id_fkey" FOREIGN KEY ("bearing_type_id") REFERENCES "BearingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
