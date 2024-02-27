-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CREATOR', 'RESPONDENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "Role"[];
