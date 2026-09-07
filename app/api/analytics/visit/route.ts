import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-service";
import { recordPageVisit } from "@/services/analytics/record-visit";
import { recordVisitorEvent } from "@/services/analytics/record-event";

const VISITOR_COOKIE = "suchay_visitor";
const SESSION_COOKIE = "suchay_visit_session";

export async function POST(request: Request) {
  try {
    if (await getCurrentUser()) return new NextResponse(null, { status: 204 });
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.path !== "string") return new NextResponse(null, { status: 400 });
    const cookieStore = await cookies();
    const visitorKey = cookieStore.get(VISITOR_COOKIE)?.value ?? randomUUID();
    const sessionKey = cookieStore.get(SESSION_COOKIE)?.value ?? randomUUID();
    const requestHeaders = await headers();
    const trustProxy = process.env.TRUST_ANALYTICS_PROXY === "true";
    await recordPageVisit({
      path: body.path,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      utmSource: typeof body.utmSource === "string" ? body.utmSource : null,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : null,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : null,
      utmContent: typeof body.utmContent === "string" ? body.utmContent : null,
      utmTerm: typeof body.utmTerm === "string" ? body.utmTerm : null,
      country: trustProxy ? requestHeaders.get("x-geo-country") : null,
      region: trustProxy ? requestHeaders.get("x-geo-region") : null,
      city: trustProxy ? requestHeaders.get("x-geo-city") : null,
      userAgent: requestHeaders.get("user-agent"), visitorKey, sessionKey,
      viewportWidth: typeof body.viewportWidth === "number" ? body.viewportWidth : null,
      viewportHeight: typeof body.viewportHeight === "number" ? body.viewportHeight : null,
      browserLanguage: typeof body.browserLanguage === "string" ? body.browserLanguage : null,
      browserTimezone: typeof body.browserTimezone === "string" ? body.browserTimezone : null,
    });
    if (body.path === "/resume") {
      await recordVisitorEvent({ type: "RESUME_VIEWED", path: body.path, visitorKey, sessionKey });
    }
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set(VISITOR_COOKIE, visitorKey, cookieOptions(60 * 60 * 24 * 365));
    response.cookies.set(SESSION_COOKIE, sessionKey, cookieOptions(60 * 30));
    return response;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge };
}
