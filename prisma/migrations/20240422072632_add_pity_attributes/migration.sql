-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "isWinnerProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalPity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Participation" ADD COLUMN     "finalWinningChance" INTEGER NOT NULL DEFAULT 0;
