ALTER TABLE "VoiceEnquiry" ADD COLUMN "audioConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "audioState" TEXT NOT NULL DEFAULT 'NONE', ADD COLUMN "audioKey" TEXT,
ADD COLUMN "audioMime" TEXT, ADD COLUMN "audioBytes" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "VoiceRecordingPart" (
  "id" TEXT NOT NULL, "enquiryId" TEXT NOT NULL, "index" INTEGER NOT NULL,
  "key" TEXT NOT NULL, "digest" TEXT NOT NULL, "bytes" INTEGER NOT NULL,
  "mime" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoiceRecordingPart_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VoiceRecordingPart_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "VoiceEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VoiceRecordingPart_key_key" ON "VoiceRecordingPart"("key");
CREATE UNIQUE INDEX "VoiceRecordingPart_enquiryId_index_key" ON "VoiceRecordingPart"("enquiryId", "index");
