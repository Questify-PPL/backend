/*
  Warnings:

  - You are about to drop the column `shortLink` on the `Link` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[link]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `link` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Link_shortLink_key";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "shortLink",
ADD COLUMN     "link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Link_link_key" ON "Link"("link");
