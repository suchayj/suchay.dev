import { NextResponse } from "next/server";
import { authorizeEnquiry, reserveVoice } from "@/services/voice-enquiries";
import { connectVoice } from "@/services/voice-runtime";
import { checkOrigin, failure, readJson, VoiceError } from "@/lib/voice/http";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    const enquiry = await authorizeEnquiry(id, request);
    const body = await readJson(request, 32000) as { sdp?: unknown };
    if (typeof body.sdp !== "string" || !body.sdp.startsWith("v=0") || body.sdp.length > 24000) throw new VoiceError("Couldn’t initialise microphone audio.");
    await reserveVoice(id);
    const sdp = await connectVoice(id, body.sdp, enquiry.callerHash);
    return NextResponse.json({ sdp }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
