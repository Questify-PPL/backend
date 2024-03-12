/*
  Warnings:

  - Added the required column `questionTypeName` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionTypeName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_sectionId_fkey" FOREIGN KEY ("formId", "sectionId") REFERENCES "Section"("formId", "sectionId") ON DELETE CASCADE ON UPDATE CASCADE;
