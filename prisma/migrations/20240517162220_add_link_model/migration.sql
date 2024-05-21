-- CreateTable
CREATE TABLE "Link" (
    "formId" TEXT NOT NULL,
    "shortLink" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_formId_key" ON "Link"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_shortLink_key" ON "Link"("shortLink");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
