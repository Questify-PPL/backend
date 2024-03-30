-- CreateTable
CREATE TABLE "InvoiceTopup" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "buktiPembayaranUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "InvoiceTopup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceTopup" ADD CONSTRAINT "InvoiceTopup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
