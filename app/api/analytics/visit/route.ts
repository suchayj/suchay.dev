import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { recordPageVisit } from "@/services/analytics/record-visit";
import { recordVisitorEvent } from "@/services/analytics/record-event";

import { resolveVisitorLocation } from "@/lib/analytics/visitor-location";
import { isTrackablePublicPath } from "@/lib/analytics/public-paths";

const VISITOR_COOKIE = "suchay_visitor";
const SESSION_COOKIE = "suchay_visit_session";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.path !== "string") return new NextResponse(null, { status: 400 });
    if (!isTrackablePublicPath(body.path)) return new NextResponse(null, { status: 204 });
    const cookieStore = await cookies();
    const visitorKey = cookieStore.get(VISITOR_COOKIE)?.value ?? randomUUID();
    const sessionKey = cookieStore.get(SESSION_COOKIE)?.value ?? randomUUID();
    const requestHeaders = await headers();
    const location = await resolveVisitorLocation(requestHeaders);
    await recordPageVisit({
      path: body.path,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      utmSource: typeof body.utmSource === "string" ? body.utmSource : null,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : null,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : null,
      utmContent: typeof body.utmContent === "string" ? body.utmContent : null,
      utmTerm: typeof body.utmTerm === "string" ? body.utmTerm : null,
      ...location,
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
