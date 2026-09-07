import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-service";
import { isVisitorEventName } from "@/lib/analytics/visitor-events";
import { recordVisitorEvent } from "@/services/analytics/record-event";

const VISITOR_COOKIE = "suchay_visitor";
const SESSION_COOKIE = "suchay_visit_session";

export async function POST(request: Request) {
  try {
    if (await getCurrentUser()) return new NextResponse(null, { status: 204 });
    const body = await request.json() as Record<string, unknown>;
    if (!isVisitorEventName(body.type) || typeof body.path !== "string") return new NextResponse(null, { status: 400 });
    const cookieStore = await cookies();
    const visitorKey = cookieStore.get(VISITOR_COOKIE)?.value;
    const sessionKey = cookieStore.get(SESSION_COOKIE)?.value;
    if (!visitorKey || !sessionKey) return new NextResponse(null, { status: 204 });
    await recordVisitorEvent({ type: body.type, path: body.path, visitorKey, sessionKey });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
