/*
  Warnings:

  - Added the required column `image` to the `BearingType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `LoadDirection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `RollingBody` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `RowCount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BearingType" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LoadDirection" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RollingBody" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RowCount" ADD COLUMN     "image" TEXT NOT NULL;
