import { NextResponse } from "next/server";
import { authorizeEnquiry } from "@/services/voice-enquiries";
import { finaliseRecording } from "@/services/voice-recordings";
import { checkOrigin, failure, readJson, VoiceError } from "@/lib/voice/http";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    const enquiry = await authorizeEnquiry(id, request);
    if (!enquiry.startedAt) throw new VoiceError("A voice conversation has not started.", 409);
    const body = await readJson(request) as { parts?: unknown; complete?: unknown };
    if (!Number.isInteger(body.parts) || typeof body.complete !== "boolean") throw new VoiceError("Invalid recording details.");
    return NextResponse.json(await finaliseRecording(id, Number(body.parts), body.complete), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
