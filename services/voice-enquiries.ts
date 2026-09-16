import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { CONSENT_VERSION, enquirySchema, voiceEnabled, voiceLimits } from "@/lib/voice/validation";
import { hash, VoiceError } from "@/lib/voice/http";

export async function createEnquiry(body: unknown, callerKey: string) {
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) throw new VoiceError("Please enter your name, email, phone with country code, reason and message, and agree to the privacy notice.");
  const { name, email, phone, reason, message } = parsed.data;
  const token = randomBytes(32).toString("base64url");
  const callerHash = hash(callerKey);
  const enquiry = await prisma.$transaction(async tx => {
    // A database lock makes limits apply across all application processes.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(16120901)`;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [personal, total] = await Promise.all([
      tx.voiceEnquiry.count({ where: { createdAt: { gte: since }, OR: [{ callerHash }, { email }, { phone }] } }),
      tx.voiceEnquiry.count({ where: { createdAt: { gte: since } } }),
    ]);
    if (personal >= 3 || total >= 100) throw new VoiceError("The enquiry limit has been reached. Please email Suchay instead.", 429);
    return tx.voiceEnquiry.create({ data: { name, email, phone, reason, message, consentVersion: CONSENT_VERSION, callerHash, accessHash: hash(token) }, select: { id: true } });
  });
  return { id: enquiry.id, token, voiceAvailable: voiceEnabled(), maxSeconds: voiceLimits().seconds };
}

export async function authorizeEnquiry(id: string, request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new VoiceError("This enquiry session has expired.", 401);
  const enquiry = await prisma.voiceEnquiry.findFirst({ where: { id, accessHash: hash(token), createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } } });
  if (!enquiry) throw new VoiceError("This enquiry session has expired.", 401);
  return enquiry;
}

export async function reserveVoice(id: string) {
  if (!voiceEnabled()) throw new VoiceError("Voice is unavailable. Your enquiry has been saved for Suchay.", 503);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(16120901)`;
    const count = await tx.voiceEnquiry.count({ where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    if (count >= voiceLimits().daily) throw new VoiceError("Today’s voice limit has been reached. Your enquiry is saved.", 429);
    const changed = await tx.voiceEnquiry.updateMany({ where: { id, state: "SAVED", startedAt: null }, data: { state: "CONNECTING", startedAt: new Date() } });
    if (!changed.count) throw new VoiceError("This enquiry already has a voice session. Your details are saved.", 409);
  });
}
