ALTER TABLE "VoiceEnquiry" ADD COLUMN "costTrackingVersion" INTEGER, ADD COLUMN "voiceModel" TEXT;
CREATE TABLE "VoiceUsage" (
 "id" TEXT NOT NULL, "enquiryId" TEXT NOT NULL, "eventKey" TEXT NOT NULL,
 "kind" TEXT NOT NULL, "model" TEXT NOT NULL, "usage" JSONB NOT NULL, "lineItems" JSONB NOT NULL,
 "costUsd" DECIMAL(18,9), "issue" TEXT, "rateVersion" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "VoiceUsage_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "VoiceUsage_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "VoiceEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VoiceUsage_enquiryId_eventKey_key" ON "VoiceUsage"("enquiryId", "eventKey");
CREATE INDEX "VoiceUsage_enquiryId_createdAt_idx" ON "VoiceUsage"("enquiryId", "createdAt");
