/*
  Warnings:

  - You are about to drop the column `description` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Section` table. All the data in the column will be lost.
  - Added the required column `prize` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "description",
ADD COLUMN     "prize" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
