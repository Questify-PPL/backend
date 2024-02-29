/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "credit" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hasCompletedProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "ssoUsername" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Creator" (
    "userId" TEXT NOT NULL,
    "emailNotificationActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Respondent" (
    "userId" TEXT NOT NULL,
    "pity" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "toUserId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("toUserId","fromUserId")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "respondentId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "emailNotificationActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("respondentId","formId")
);

-- CreateTable
CREATE TABLE "Winner" (
    "respondentId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("respondentId","formId")
);

-- CreateTable
CREATE TABLE "Question" (
    "formId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("formId","no")
);

-- CreateTable
CREATE TABLE "Answer" (
    "formId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "respondentId" TEXT NOT NULL,
    "answer" TEXT[],

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("formId","questionNo","respondentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Respondent_userId_key" ON "Respondent"("userId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respondent" ADD CONSTRAINT "Respondent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formId_questionNo_fkey" FOREIGN KEY ("formId", "questionNo") REFERENCES "Question"("formId", "no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
