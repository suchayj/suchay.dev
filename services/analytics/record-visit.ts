import { prisma } from "../../lib/db";
import { isTrackablePublicPath } from "../../lib/analytics/public-paths";

export type VisitInput = {
  path: string; referrer?: string | null; utmSource?: string | null;
  utmMedium?: string | null; utmCampaign?: string | null;
  country?: string | null; region?: string | null; city?: string | null;
  userAgent?: string | null; visitorKey: string; sessionKey: string;
};

const clean = (value: string | null | undefined, max: number) => value?.trim().slice(0, max) || null;

export async function recordPageVisit(input: VisitInput) {
  if (!isTrackablePublicPath(input.path)) return false;
  await prisma.pageVisit.create({ data: {
    path: input.path.slice(0, 300),
    referrer: clean(input.referrer, 500),
    utmSource: clean(input.utmSource, 120),
    utmMedium: clean(input.utmMedium, 120),
    utmCampaign: clean(input.utmCampaign, 160),
    country: clean(input.country, 100),
    region: clean(input.region, 120),
    city: clean(input.city, 120),
    userAgent: clean(input.userAgent, 500),
    visitorKey: input.visitorKey,
    sessionKey: input.sessionKey,
  } });
  return true;
}
