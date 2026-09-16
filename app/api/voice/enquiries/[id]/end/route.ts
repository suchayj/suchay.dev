import { NextResponse } from "next/server";
import { authorizeEnquiry } from "@/services/voice-enquiries";
import { endVoice } from "@/services/voice-runtime";
import { checkOrigin, failure, readJson, VoiceError } from "@/lib/voice/http";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    await authorizeEnquiry(id, request);
    const body = await readJson(request) as { outcome?: unknown };
    if (!["COMPLETED", "INTERRUPTED", "LIMIT_REACHED"].includes(String(body.outcome))) throw new VoiceError("Invalid call outcome.");
    await endVoice(id, String(body.outcome));
    return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
