CREATE TABLE "VoiceEnquiry" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL, "reason" TEXT NOT NULL, "message" TEXT NOT NULL,
  "consentVersion" TEXT NOT NULL, "accessHash" TEXT NOT NULL, "callerHash" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'SAVED', "followUp" TEXT NOT NULL DEFAULT 'NEW',
  "callId" TEXT, "transcript" TEXT NOT NULL DEFAULT '', "summary" TEXT, "summaryKind" TEXT,
  "inputTokens" INTEGER NOT NULL DEFAULT 0, "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3), "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VoiceEnquiry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VoiceEnquiry_accessHash_key" ON "VoiceEnquiry"("accessHash");
CREATE UNIQUE INDEX "VoiceEnquiry_callId_key" ON "VoiceEnquiry"("callId");
CREATE INDEX "VoiceEnquiry_createdAt_idx" ON "VoiceEnquiry"("createdAt");
CREATE INDEX "VoiceEnquiry_callerHash_createdAt_idx" ON "VoiceEnquiry"("callerHash", "createdAt");
CREATE INDEX "VoiceEnquiry_email_createdAt_idx" ON "VoiceEnquiry"("email", "createdAt");
CREATE INDEX "VoiceEnquiry_state_startedAt_idx" ON "VoiceEnquiry"("state", "startedAt");
