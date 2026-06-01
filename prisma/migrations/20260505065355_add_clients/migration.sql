-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "followersStart" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "contentSheetUrl" TEXT,
    "scriptDocUrl" TEXT,
    "notes" TEXT,
    "ddmUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_ddmUserId_fkey" FOREIGN KEY ("ddmUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
