/*
  Warnings:

  - The primary key for the `Answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `questionNo` on the `Answer` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `choices` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Question` table. All the data in the column will be lost.
  - Changed the type of `answer` on the `Answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `description` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'CHECKBOX', 'RADIO');

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_formId_questionNo_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_respondentId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_formId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_pkey",
DROP COLUMN "questionNo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "answer",
ADD COLUMN     "answer" JSONB NOT NULL,
ADD CONSTRAINT "Answer_pkey" PRIMARY KEY ("respondentId", "formId");

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxParticipant" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Participation" ALTER COLUMN "isCompleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "choices",
DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionType" "QuestionType" NOT NULL,
ADD COLUMN     "sectionId" INTEGER NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("formId", "sectionId", "no");

-- CreateTable
CREATE TABLE "Section" (
    "formId" TEXT NOT NULL,
    "sectionId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("formId","sectionId")
);

-- CreateTable
CREATE TABLE "Text" (
    "formId" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "no" INTEGER NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("formId","sectionId","no")
);

-- CreateTable
CREATE TABLE "Checkbox" (
    "formId" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "no" INTEGER NOT NULL,
    "choice" TEXT[],

    CONSTRAINT "Checkbox_pkey" PRIMARY KEY ("formId","sectionId","no")
);

-- CreateTable
CREATE TABLE "Radio" (
    "formId" TEXT NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "no" INTEGER NOT NULL,
    "choice" TEXT[],

    CONSTRAINT "Radio_pkey" PRIMARY KEY ("formId","sectionId","no")
);

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_sectionId_fkey" FOREIGN KEY ("formId", "sectionId") REFERENCES "Section"("formId", "sectionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_formId_sectionId_no_fkey" FOREIGN KEY ("formId", "sectionId", "no") REFERENCES "Question"("formId", "sectionId", "no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkbox" ADD CONSTRAINT "Checkbox_formId_sectionId_no_fkey" FOREIGN KEY ("formId", "sectionId", "no") REFERENCES "Question"("formId", "sectionId", "no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radio" ADD CONSTRAINT "Radio_formId_sectionId_no_fkey" FOREIGN KEY ("formId", "sectionId", "no") REFERENCES "Question"("formId", "sectionId", "no") ON DELETE RESTRICT ON UPDATE CASCADE;
