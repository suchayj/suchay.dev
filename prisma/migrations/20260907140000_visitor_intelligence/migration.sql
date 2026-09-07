CREATE TYPE "VisitorEventType" AS ENUM (
  'RESUME_VIEWED',
  'CONTACT_OPENED',
  'EMAIL_CONTINUE_CLICKED',
  'RENTORA_OPENED',
  'EDVORA_OPENED',
  'LOOM_OPENED',
  'GITHUB_OPENED',
  'LINKEDIN_OPENED'
);

ALTER TABLE "PageVisit"
  ADD COLUMN "utmContent" TEXT,
  ADD COLUMN "utmTerm" TEXT,
  ADD COLUMN "viewportWidth" INTEGER,
  ADD COLUMN "viewportHeight" INTEGER,
  ADD COLUMN "browserLanguage" TEXT,
  ADD COLUMN "browserTimezone" TEXT;

CREATE TABLE "VisitorEvent" (
  "id" TEXT NOT NULL,
  "visitorKey" TEXT NOT NULL,
  "sessionKey" TEXT NOT NULL,
  "type" "VisitorEventType" NOT NULL,
  "path" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VisitorEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitorEvent_occurredAt_idx" ON "VisitorEvent"("occurredAt");
CREATE INDEX "VisitorEvent_sessionKey_occurredAt_idx" ON "VisitorEvent"("sessionKey", "occurredAt");
CREATE INDEX "VisitorEvent_visitorKey_occurredAt_idx" ON "VisitorEvent"("visitorKey", "occurredAt");
