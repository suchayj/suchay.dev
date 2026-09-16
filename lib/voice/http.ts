import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export class VoiceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function checkOrigin(request: Request) {
  const allowed = process.env.APP_ORIGIN ?? (process.env.NODE_ENV === "production" ? "https://suchay.dev" : new URL(request.url).origin);
  if (request.headers.get("origin") !== allowed) throw new VoiceError("Please use the contact form on suchay.dev.", 403);
}
export async function readJson(request: Request, maxBytes = 12000) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new VoiceError("Expected JSON.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new VoiceError("Missing request.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new VoiceError("Request is too large.", 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new VoiceError("Invalid request."); }
}
export function failure(error: unknown) {
  const known = error instanceof VoiceError;
  if (!known) console.error("Voice enquiry request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: known ? error.message : "We couldn’t save this right now. Please try again or use email." }, { status: known ? error.status : 503, headers: { "Cache-Control": "no-store" } });
}
