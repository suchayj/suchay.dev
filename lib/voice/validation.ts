import { z } from "zod";

export const CONSENT_VERSION = "voice-enquiry-v1";
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().transform(value => value.replace(/[\s().-]/g, ""))
    .refine(value => /^\+[1-9]\d{7,14}$/.test(value), "Include your country code, for example +91.")
    .refine(value => !value.startsWith("+91") || /^\+91[6-9]\d{9}$/.test(value), "Enter a valid 10-digit Indian mobile number."),
  reason: z.enum(["Hiring", "Project enquiry", "Collaboration", "Other"]),
  message: z.string().trim().min(10).max(1500),
  consent: z.literal(true),
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
  return process.env.VOICE_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY);
}
