import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-service";
import { recordingPlayback } from "@/services/voice-recordings";
import { failure } from "@/lib/voice/http";
export const runtime = "nodejs";
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getCurrentUser()) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const { id } = await context.params;
    return NextResponse.redirect(await recordingPlayback(id), { status: 302, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) { return failure(error); }
}
