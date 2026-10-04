import { z } from "zod";
import { recordingStorageConfigured } from "./audio-storage";
import { validOptionalPhone } from "./phone";

export const CONSENT_VERSION = "voice-enquiry-v3";
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  phone: z.string().trim().max(30).default("").transform(value => value.replace(/[\s().-]/g, ""))
    .refine(validOptionalPhone, "Enter a valid mobile number including its country code, or leave it blank."),
  reason: z.enum(["Hiring", "Project enquiry", "Collaboration", "Other"]),
  message: z.string().trim().min(10).max(1500),
  consent: z.literal(true),
  audioConsent: z.boolean().default(false),
  website: z.string().max(0).optional(),
});

export function boundedInteger(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}
export function voiceLimits() {
  return {
    seconds: boundedInteger(process.env.VOICE_MAX_SECONDS, 180, 300),
    daily: boundedInteger(process.env.VOICE_DAILY_CALL_LIMIT, 20, 100),
  };
}
export function voiceEnabled() {
  return process.env.VOICE_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY) && recordingStorageConfigured();
}
