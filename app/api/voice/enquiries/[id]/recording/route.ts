import { NextResponse } from "next/server";
import { authorizeEnquiry } from "@/services/voice-enquiries";
import { storeRecordingPart } from "@/services/voice-recordings";
import { checkOrigin, failure, VoiceError } from "@/lib/voice/http";
import { MAX_PART_BYTES } from "@/lib/voice/recording-format";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    await authorizeEnquiry(id, request);
    const rawIndex = new URL(request.url).searchParams.get("part");
    if (!rawIndex || !/^\d{1,3}$/.test(rawIndex)) throw new VoiceError("Invalid recording part.");
    const reader = request.body?.getReader();
    if (!reader) throw new VoiceError("Missing recording.");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PART_BYTES) { await reader.cancel(); throw new VoiceError("Recording part too large.", 413); }
      chunks.push(value);
    }
    const result = await storeRecordingPart(id, Number(rawIndex), request.headers.get("content-type") ?? "", Buffer.concat(chunks));
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
