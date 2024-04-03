/*
  Warnings:

  - The `status` column on the `InvoiceTopup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `creatorName` to the `InvoiceTopup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchange` to the `InvoiceTopup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment` to the `InvoiceTopup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "InvoiceTopup" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "creatorName" TEXT NOT NULL,
ADD COLUMN     "exchange" TEXT NOT NULL,
ADD COLUMN     "payment" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING';
