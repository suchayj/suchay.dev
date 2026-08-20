CREATE TYPE "JobStatus" AS ENUM ('NEW', 'SHORTLISTED', 'APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER');
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "JobSource" AS ENUM ('MANUAL_SEED', 'MANUAL');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "source" "JobSource" NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'NEW',
  "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
  "fitScore" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_priority_idx" ON "Job"("priority");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
