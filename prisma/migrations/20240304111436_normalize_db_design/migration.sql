/*
  Warnings:

  - The primary key for the `Answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Checkbox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no` on the `Checkbox` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Checkbox` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `Radio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no` on the `Radio` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Radio` table. All the data in the column will be lost.
  - The primary key for the `Text` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `no` on the `Text` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Text` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Checkbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prizeType` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Radio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Text` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('EVEN', 'LUCKY');

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_formId_fkey";

-- DropForeignKey
ALTER TABLE "Checkbox" DROP CONSTRAINT "Checkbox_formId_sectionId_no_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_formId_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "Radio" DROP CONSTRAINT "Radio_formId_sectionId_no_fkey";

-- DropForeignKey
ALTER TABLE "Text" DROP CONSTRAINT "Text_formId_sectionId_no_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_pkey",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "Answer_pkey" PRIMARY KEY ("respondentId", "questionId", "formId");

-- AlterTable
ALTER TABLE "Checkbox" DROP CONSTRAINT "Checkbox_pkey",
DROP COLUMN "no",
DROP COLUMN "sectionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "Checkbox_pkey" PRIMARY KEY ("formId", "questionId");

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "maxWinner" INTEGER,
ADD COLUMN     "prizeType" "PrizeType" NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "no",
ADD COLUMN     "questionId" SERIAL NOT NULL,
ALTER COLUMN "sectionId" DROP NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("formId", "questionId");

-- AlterTable
ALTER TABLE "Radio" DROP CONSTRAINT "Radio_pkey",
DROP COLUMN "no",
DROP COLUMN "sectionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "Radio_pkey" PRIMARY KEY ("formId", "questionId");

-- AlterTable
ALTER TABLE "Text" DROP CONSTRAINT "Text_pkey",
DROP COLUMN "no",
DROP COLUMN "sectionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "Text_pkey" PRIMARY KEY ("formId", "questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_formId_questionId_fkey" FOREIGN KEY ("formId", "questionId") REFERENCES "Question"("formId", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkbox" ADD CONSTRAINT "Checkbox_formId_questionId_fkey" FOREIGN KEY ("formId", "questionId") REFERENCES "Question"("formId", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_formId_questionId_fkey" FOREIGN KEY ("formId", "questionId") REFERENCES "Question"("formId", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formId_questionId_fkey" FOREIGN KEY ("formId", "questionId") REFERENCES "Question"("formId", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;
