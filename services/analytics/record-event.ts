import { prisma } from "@/lib/db";
import { isTrackablePublicPath } from "@/lib/analytics/public-paths";
import type { VisitorEventName } from "@/lib/analytics/visitor-events";

export async function recordVisitorEvent(input: { type: VisitorEventName; path: string; visitorKey: string; sessionKey: string }) {
  if (!isTrackablePublicPath(input.path)) return false;
  await prisma.visitorEvent.create({ data: {
    type: input.type,
    path: input.path.slice(0, 300),
    visitorKey: input.visitorKey,
    sessionKey: input.sessionKey,
  } });
  return true;
}
