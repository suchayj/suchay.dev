CREATE TYPE "CompanyTargetStatus" AS ENUM ('TARGET', 'WATCH', 'EXCLUDED');
CREATE TYPE "CompanyCategory" AS ENUM ('PRODUCT_TECH', 'FINTECH_PAYMENTS', 'BANKING_TECH', 'ENTERPRISE_PLATFORM', 'ENGINEERING_SERVICES', 'CONSULTING');

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "aliases" TEXT[],
  "targetStatus" "CompanyTargetStatus" NOT NULL DEFAULT 'TARGET',
  "categories" "CompanyCategory"[],
  "careerUrl" TEXT,
  "knownLocations" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageVisit" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "referrer" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "userAgent" TEXT,
  "visitorKey" TEXT NOT NULL,
  "sessionKey" TEXT NOT NULL,
  CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Job" ADD COLUMN "companyId" TEXT;
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Company_targetStatus_idx" ON "Company"("targetStatus");
CREATE INDEX "PageVisit_visitedAt_idx" ON "PageVisit"("visitedAt");
CREATE INDEX "PageVisit_path_idx" ON "PageVisit"("path");
CREATE INDEX "PageVisit_visitorKey_idx" ON "PageVisit"("visitorKey");
CREATE INDEX "PageVisit_sessionKey_idx" ON "PageVisit"("sessionKey");
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
