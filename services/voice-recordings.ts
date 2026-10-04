import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { VoiceError } from "@/lib/voice/http";
import { voiceLimits } from "@/lib/voice/validation";
import { audioExtension, audioType, validAudioHeader, MAX_AUDIO_BYTES, MAX_AUDIO_PARTS, MAX_PART_BYTES, conversationPrefix, putPrivateAudio, readAudioPart, deleteAudioParts, deleteConversationAudio, privatePlaybackUrl, recordingStorageConfigured } from "@/lib/voice/audio-storage";

export async function storeRecordingPart(id: string, index: number, type: string, bytes: Buffer) {
  const mime = audioType(type);
  if (!Number.isInteger(index) || index < 0 || index >= MAX_AUDIO_PARTS || !audioExtension(mime) || !bytes.length || bytes.length > MAX_PART_BYTES) throw new VoiceError("Invalid recording part.");
  if (index === 0 && !validAudioHeader(mime, bytes)) throw new VoiceError("Unsupported recording format.");
  if (!recordingStorageConfigured()) throw new VoiceError("Audio storage is unavailable.", 503);
  const digest = createHash("sha256").update(bytes).digest("hex");
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`voice-audio:${id}`}))`;
    const enquiry = await tx.voiceEnquiry.findUniqueOrThrow({ where: { id } });
    if (!enquiry.audioConsent || !enquiry.startedAt) throw new VoiceError("Recording consent or conversation is missing.", 403);
    if (Date.now() - enquiry.startedAt.getTime() > (voiceLimits().seconds + 120) * 1000) throw new VoiceError("The recording upload window has ended.", 403);
    const existing = await tx.voiceRecordingPart.findUnique({ where: { enquiryId_index: { enquiryId: id, index } } });
    if (existing) {
      if (existing.digest !== digest || existing.mime !== mime) throw new VoiceError("This recording part is already saved.", 409);
      return { saved: true };
    }
    if (["READY", "PARTIAL"].includes(enquiry.audioState)) throw new VoiceError("The recording is already finalised.", 409);
    if (enquiry.audioMime && enquiry.audioMime !== mime) throw new VoiceError("The recording format changed.", 409);
    const total = await tx.voiceRecordingPart.aggregate({ where: { enquiryId: id }, _sum: { bytes: true }, _count: true });
    if ((total._sum.bytes ?? 0) + bytes.length > MAX_AUDIO_BYTES || total._count >= MAX_AUDIO_PARTS) throw new VoiceError("The recording limit was reached.", 413);
    const key = `${conversationPrefix(id)}parts/${String(index).padStart(4, "0")}.bin`;
    await putPrivateAudio(key, bytes, "application/octet-stream");
    await tx.voiceRecordingPart.create({ data: { enquiryId: id, index, key, digest, bytes: bytes.length, mime } });
    await tx.voiceEnquiry.update({ where: { id }, data: { audioState: "UPLOADING", audioMime: mime } });
    return { saved: true };
  }, { maxWait: 10000, timeout: 25000 });
}

export async function finaliseRecording(id: string, expectedParts?: number, complete = false) {
  if (expectedParts !== undefined && (!Number.isInteger(expectedParts) || expectedParts < 1 || expectedParts > MAX_AUDIO_PARTS)) throw new VoiceError("Invalid recording length.");
  const result = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`voice-audio:${id}`}))`;
    const enquiry = await tx.voiceEnquiry.findUniqueOrThrow({ where: { id } });
    if (!enquiry.audioConsent) throw new VoiceError("Recording consent is missing.", 403);
    if (["READY", "PARTIAL"].includes(enquiry.audioState)) return { saved: true, partial: enquiry.audioState === "PARTIAL", keys: [] as string[] };
    const parts = await tx.voiceRecordingPart.findMany({ where: { enquiryId: id }, orderBy: { index: "asc" } });
    if (!parts.length) return { saved: false, partial: true, keys: [] as string[] };
    const contiguous = [] as typeof parts;
    for (const part of parts) { if (part.index !== contiguous.length) break; contiguous.push(part); }
    if (!contiguous.length) throw new VoiceError("The beginning of the recording was not captured.", 409);
    const buffers: Buffer[] = [];
    for (const part of contiguous) {
      if (!part.key.startsWith(`${conversationPrefix(id)}parts/`)) throw new Error("Invalid recording object");
      const bytes = await readAudioPart(part.key);
      if (bytes.length !== part.bytes || createHash("sha256").update(bytes).digest("hex") !== part.digest) throw new Error("Recording integrity check failed");
      buffers.push(bytes);
    }
    const bytes = Buffer.concat(buffers);
    if (bytes.length > MAX_AUDIO_BYTES || !validAudioHeader(enquiry.audioMime!, bytes)) throw new Error("Invalid assembled recording");
    const key = `${conversationPrefix(id)}conversation.${audioExtension(enquiry.audioMime!)}`;
    await putPrivateAudio(key, bytes, enquiry.audioMime!);
    const partial = !complete || expectedParts !== parts.length || contiguous.length !== parts.length;
    await tx.voiceEnquiry.update({ where: { id }, data: { audioState: partial ? "PARTIAL" : "READY", audioKey: key, audioBytes: bytes.length } });
    return { saved: true, partial, keys: parts.map(part => part.key) };
  }, { maxWait: 10000, timeout: 90000 });
  if (result.keys.length) {
    // The playable recording is durable before temporary parts are removed. Failed cleanup can be retried on deletion.
    await deleteAudioParts(id, result.keys).then(() => prisma.voiceRecordingPart.deleteMany({ where: { enquiryId: id, key: { in: result.keys } } })).catch(() => console.error("Recording part cleanup requires attention", id));
  }
  return { saved: result.saved, partial: result.partial };
}

export function recoverRecordingLater(id: string) {
  const timer = setTimeout(() => { void prisma.voiceEnquiry.findUnique({ where: { id }, select: { audioState: true } }).then(row => row?.audioState === "UPLOADING" ? finaliseRecording(id) : undefined).catch(() => console.error("Partial recording recovery requires attention", id)); }, 120000);
  timer.unref();
}
export async function recordingPlayback(id: string) {
  let enquiry = await prisma.voiceEnquiry.findUnique({ where: { id } });
  if (!enquiry) throw new VoiceError("Conversation not found.", 404);
  if (!enquiry.audioKey && enquiry.audioState === "UPLOADING") {
    if (!enquiry.endedAt && enquiry.startedAt && Date.now() - enquiry.startedAt.getTime() <= (voiceLimits().seconds + 120) * 1000) throw new VoiceError("Audio is still being saved. Try again after the conversation ends.", 409);
    if (enquiry.endedAt && Date.now() - enquiry.endedAt.getTime() < 120000) throw new VoiceError("Audio is still being saved. Try again shortly.", 409);
    await finaliseRecording(id);
    enquiry = await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id } });
  }
  if (!enquiry.audioKey || !enquiry.audioKey.startsWith(conversationPrefix(id))) throw new VoiceError("No recording was captured for this conversation.", 404);
  return privatePlaybackUrl(enquiry.audioKey);
}

export async function deleteRecordedEnquiry(id: string) {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`voice-audio:${id}`}))`;
    const enquiry = await tx.voiceEnquiry.findUniqueOrThrow({ where: { id } });
    if (enquiry.audioConsent || enquiry.audioKey || enquiry.audioState === "UPLOADING") await deleteConversationAudio(id);
    await tx.voiceEnquiry.delete({ where: { id } });
  }, { maxWait: 10000, timeout: 60000 });
}
