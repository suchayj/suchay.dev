import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createEnquiry } from "@/services/voice-enquiries";
import { checkOrigin, failure, readJson } from "@/lib/voice/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const cookieStore = await cookies();
    const existing = cookieStore.get("suchay_enquiry")?.value;
    const browserKey = existing && /^[a-f0-9-]{36}$/.test(existing) ? existing : randomUUID();
    // Trust a proxy address only when the deployment overwrites this header.
    const callerKey = process.env.TRUST_VOICE_PROXY === "true" ? request.headers.get("x-real-ip") || browserKey : browserKey;
    const enquiry = await createEnquiry(await readJson(request), callerKey);
    const response = NextResponse.json(enquiry, { status: 201, headers: { "Cache-Control": "no-store" } });
    response.cookies.set("suchay_enquiry", browserKey, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86400 });
    return response;
  } catch (error) { return failure(error); }
}
