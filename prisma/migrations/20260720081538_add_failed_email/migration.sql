-- CreateTable
CREATE TABLE "FailedEmail" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "context" TEXT,
    "errorMessage" TEXT NOT NULL,
    "retriedAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedEmail_pkey" PRIMARY KEY ("id")
);
