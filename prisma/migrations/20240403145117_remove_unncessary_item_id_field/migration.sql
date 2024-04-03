/*
  Warnings:

  - You are about to drop the column `itemId` on the `Voucher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_itemId_fkey";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "itemId";

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_usedItemId_fkey" FOREIGN KEY ("usedItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
