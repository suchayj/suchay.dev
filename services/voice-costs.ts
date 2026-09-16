import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { priceUsage, RATE_VERSION, type CostKind } from "@/lib/voice/costs";

export async function recordVoiceUsage(enquiryId: string, eventKey: string, kind: CostKind, model: string, usage: unknown) {
  const priced = priceUsage(kind, model, usage);
  // Keep usage counters only, never whole provider events containing audio or transcript content.
  const raw = usage && typeof usage === "object" ? JSON.parse(JSON.stringify(usage)) : {};
  await prisma.voiceUsage.upsert({
    where: { enquiryId_eventKey: { enquiryId, eventKey } },
    create: { enquiryId, eventKey, kind, model, usage: raw, lineItems: priced.lines as unknown as Prisma.InputJsonValue,
      costUsd: priced.usd === null ? null : priced.usd.toFixed(9), issue: priced.issue, rateVersion: RATE_VERSION },
    update: {},
  });
}
