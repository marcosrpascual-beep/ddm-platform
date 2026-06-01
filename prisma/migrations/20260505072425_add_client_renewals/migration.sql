-- CreateTable
CREATE TABLE "ClientRenewal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRenewal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientRenewal" ADD CONSTRAINT "ClientRenewal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
