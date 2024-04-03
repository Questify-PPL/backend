/*
  Warnings:

  - Made the column `credit` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "credit" SET NOT NULL,
ALTER COLUMN "credit" SET DEFAULT 0;
