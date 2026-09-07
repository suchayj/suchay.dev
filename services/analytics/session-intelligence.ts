import { Prisma, type PageVisit, type VisitorEvent } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getVisitorRetentionCutoff, resolveVisitorFilter, type VisitorFilterInput } from "@/lib/analytics/visitor-presentation";
import { anonymousSessionId, anonymousVisitorLabel, classifySource, observedDuration, parseUserAgent, readablePath, type DeviceKind, type SourceKind } from "@/lib/analytics/session-presentation";

export type SessionFilters = VisitorFilterInput & { visitor?: "all" | "new" | "returning"; device?: "all" | DeviceKind; source?: "all" | SourceKind };
export type SessionRequest = { page?: number; filters?: SessionFilters; selectedSessionKey?: string };

type SessionRow = { sessionKey: string; visitorKey: string; startAt: Date; endAt: Date; pageCount: bigint };
type StatsRow = { sessions: bigint; visitors: bigint; pageViews: bigint; newVisitors: bigint; returningVisitors: bigint; resumeViews: bigint; contactOpens: bigint; productOpens: bigint };

const eventLabels: Record<string, string> = {
  RESUME_VIEWED: "Résumé viewed", CONTACT_OPENED: "Contact opened", EMAIL_CONTINUE_CLICKED: "Email draft continued",
  RENTORA_OPENED: "Rentora opened", EDVORA_OPENED: "Edvora opened", LOOM_OPENED: "Loom opened",
  GITHUB_OPENED: "GitHub opened", LINKEDIN_OPENED: "LinkedIn opened",
};

function baseSql(filters: SessionFilters, now: Date) {
  const retentionCutoff = getVisitorRetentionCutoff(now);
  const date = resolveVisitorFilter(filters, now);
  const start = date.startAt && date.startAt > retentionCutoff ? date.startAt : retentionCutoff;
  const conditions = [Prisma.sql`"visitedAt" >= ${start}`];
  if (date.endAt) conditions.push(Prisma.sql`"visitedAt" < ${date.endAt}`);
  return { date, retentionCutoff, where: Prisma.join(conditions, " AND ") };
}

function sessionFilterSql(filters: SessionFilters) {
  const conditions: Prisma.Sql[] = [];
  if (filters.visitor === "new") conditions.push(Prisma.sql`NOT EXISTS (SELECT 1 FROM "PageVisit" prior WHERE prior."visitorKey" = s."visitorKey" AND prior."visitedAt" < s."startAt")`);
  if (filters.visitor === "returning") conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "PageVisit" prior WHERE prior."visitorKey" = s."visitorKey" AND prior."visitedAt" < s."startAt")`);
  if (filters.device && filters.device !== "all") {
    const expression = filters.device === "Tablet" ? "%tablet%" : filters.device === "Mobile" ? "%mobile%" : filters.device === "Desktop" ? "%" : "__unknown__";
    if (filters.device === "Desktop") conditions.push(Prisma.sql`COALESCE(first_visit."userAgent", '') NOT ILIKE '%mobile%' AND COALESCE(first_visit."userAgent", '') NOT ILIKE '%tablet%'`);
    else if (filters.device === "Unknown") conditions.push(Prisma.sql`first_visit."userAgent" IS NULL`);
    else conditions.push(Prisma.sql`first_visit."userAgent" ILIKE ${expression}`);
  }
  if (filters.source && filters.source !== "all") {
    if (filters.source === "Direct") conditions.push(Prisma.sql`first_visit."utmSource" IS NULL AND first_visit."referrer" IS NULL`);
    else if (filters.source === "UTM/campaign") conditions.push(Prisma.sql`first_visit."utmSource" IS NOT NULL`);
    else if (filters.source === "Google") conditions.push(Prisma.sql`(LOWER(COALESCE(first_visit."utmSource", '')) = 'google' OR first_visit."referrer" ILIKE '%google.%')`);
    else if (filters.source === "LinkedIn") conditions.push(Prisma.sql`(LOWER(COALESCE(first_visit."utmSource", '')) = 'linkedin' OR first_visit."referrer" ILIKE '%linkedin.%')`);
    else conditions.push(Prisma.sql`first_visit."utmSource" IS NULL AND first_visit."referrer" IS NOT NULL AND first_visit."referrer" NOT ILIKE '%google.%' AND first_visit."referrer" NOT ILIKE '%linkedin.%'`);
  }
  return conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
}

function sessionCte(where: Prisma.Sql) {
  return Prisma.sql`WITH s AS (
    SELECT "sessionKey", "visitorKey", MIN("visitedAt") AS "startAt", MAX("visitedAt") AS "endAt", COUNT(*)::bigint AS "pageCount",
      (ARRAY_AGG("id" ORDER BY "visitedAt" ASC, "id" ASC))[1] AS "firstVisitId"
    FROM "PageVisit" WHERE ${where} GROUP BY "sessionKey", "visitorKey"
  ), filtered AS (
    SELECT s.* FROM s JOIN "PageVisit" first_visit ON first_visit."id" = s."firstVisitId"
  `;
}

export async function getSessionIntelligence(request: SessionRequest = {}) {
  const now = new Date();
  const filters = request.filters ?? {};
  const { date, retentionCutoff, where } = baseSql(filters, now);
  const sessionWhere = sessionFilterSql(filters);
  const cte = sessionCte(where);
  const statsRows = await prisma.$queryRaw<StatsRow[]>(Prisma.sql`${cte} ${sessionWhere}) SELECT
    COUNT(*)::bigint AS sessions,
    COUNT(DISTINCT "visitorKey")::bigint AS visitors,
    COALESCE(SUM("pageCount"), 0)::bigint AS "pageViews",
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "PageVisit" prior WHERE prior."visitorKey" = filtered."visitorKey" AND prior."visitedAt" < filtered."startAt"))::bigint AS "newVisitors",
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "PageVisit" prior WHERE prior."visitorKey" = filtered."visitorKey" AND prior."visitedAt" < filtered."startAt"))::bigint AS "returningVisitors",
    (SELECT COUNT(*) FROM "VisitorEvent" e WHERE e."sessionKey" IN (SELECT "sessionKey" FROM filtered) AND e."type" = 'RESUME_VIEWED')::bigint AS "resumeViews",
    (SELECT COUNT(*) FROM "VisitorEvent" e WHERE e."sessionKey" IN (SELECT "sessionKey" FROM filtered) AND e."type" = 'CONTACT_OPENED')::bigint AS "contactOpens",
    (SELECT COUNT(*) FROM "VisitorEvent" e WHERE e."sessionKey" IN (SELECT "sessionKey" FROM filtered) AND e."type" IN ('RENTORA_OPENED', 'EDVORA_OPENED', 'LOOM_OPENED'))::bigint AS "productOpens"
    FROM filtered`);
  const stats = statsRows[0];
  const totalSessions = Number(stats?.sessions ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalSessions / 25));
  const page = Math.min(Math.max(1, request.page ?? 1), totalPages);
  const offset = (page - 1) * 25;
  const rows = await prisma.$queryRaw<SessionRow[]>(Prisma.sql`${cte} ${sessionWhere}) SELECT "sessionKey", "visitorKey", "startAt", "endAt", "pageCount" FROM filtered ORDER BY "startAt" DESC, "sessionKey" DESC LIMIT 25 OFFSET ${offset}`);
  const sessionKeys = rows.map((row) => row.sessionKey);
  const visitorKeys = [...new Set(rows.map((row) => row.visitorKey))];
  const [pageVisits, events, visitorVisits] = await Promise.all([
    sessionKeys.length ? prisma.pageVisit.findMany({ where: { sessionKey: { in: sessionKeys } }, orderBy: [{ visitedAt: "asc" }, { id: "asc" }] }) : [],
    sessionKeys.length ? prisma.visitorEvent.findMany({ where: { sessionKey: { in: sessionKeys } }, orderBy: [{ occurredAt: "asc" }, { id: "asc" }] }) : [],
    visitorKeys.length ? prisma.pageVisit.findMany({ where: { visitorKey: { in: visitorKeys } }, orderBy: [{ visitedAt: "asc" }, { id: "asc" }] }) : [],
  ]);

  const sessions = rows.map((row) => buildSession(row, pageVisits.filter((visit) => visit.sessionKey === row.sessionKey), events.filter((event) => event.sessionKey === row.sessionKey), visitorVisits.filter((visit) => visit.visitorKey === row.visitorKey)));
  const metrics = {
    anonymousVisitors: Number(stats?.visitors ?? 0),
    sessions: totalSessions,
    pageViews: Number(stats?.pageViews ?? 0),
    newVisitors: Number(stats?.newVisitors ?? 0),
    returningVisitors: Number(stats?.returningVisitors ?? 0),
    resumeViews: Number(stats?.resumeViews ?? 0),
    contactOpens: Number(stats?.contactOpens ?? 0),
    productOpens: Number(stats?.productOpens ?? 0),
  };
  return { sessions, metrics, pagination: { page, totalPages, totalSessions, pageSize: 25 }, filter: date, retentionCutoff };
}

function buildSession(row: SessionRow, visits: PageVisit[], events: VisitorEvent[], history: PageVisit[]) {
  const landing = visits[0];
  const prior = history.filter((visit) => visit.visitedAt < row.startAt);
  const allSessionKeys = new Set(history.map((visit) => visit.sessionKey));
  const previousSessionMap = new Map<string, PageVisit[]>();
  for (const visit of history) {
    if (visit.sessionKey === row.sessionKey) continue;
    const existing = previousSessionMap.get(visit.sessionKey) ?? [];
    existing.push(visit);
    previousSessionMap.set(visit.sessionKey, existing);
  }
  const previousSessions = [...previousSessionMap.entries()].map(([sessionKey, sessionVisits]) => ({
    sessionId: anonymousSessionId(sessionKey),
    startAt: sessionVisits[0].visitedAt,
    pageCount: sessionVisits.length,
    journey: sessionVisits.map((visit) => readablePath(visit.path)),
  })).sort((a, b) => b.startAt.getTime() - a.startAt.getTime()).slice(0, 5);
  const source = classifySource({ utmSource: landing?.utmSource ?? null, utmMedium: landing?.utmMedium ?? null, utmCampaign: landing?.utmCampaign ?? null, referrer: landing?.referrer ?? null });
  const agent = parseUserAgent(landing?.userAgent ?? null);
  return {
    sessionId: anonymousSessionId(row.sessionKey),
    visitorLabel: anonymousVisitorLabel(row.visitorKey),
    returning: prior.length > 0,
    startAt: row.startAt,
    endAt: row.endAt,
    pageCount: Number(row.pageCount),
    duration: observedDuration(row.startAt, row.endAt, Number(row.pageCount)),
    journey: visits.map((visit, index) => ({ path: visit.path, label: readablePath(visit.path), visitedAt: visit.visitedAt, secondsToNext: visits[index + 1] ? Math.floor((visits[index + 1].visitedAt.getTime() - visit.visitedAt.getTime()) / 1000) : null })),
    device: agent,
    source,
    location: [landing?.city, landing?.region, landing?.country].filter(Boolean).join(", ") || null,
    context: landing ? { viewportWidth: landing.viewportWidth, viewportHeight: landing.viewportHeight, browserLanguage: landing.browserLanguage, browserTimezone: landing.browserTimezone, referrer: landing.referrer, utmSource: landing.utmSource, utmMedium: landing.utmMedium, utmCampaign: landing.utmCampaign, utmContent: landing.utmContent, utmTerm: landing.utmTerm } : null,
    engagement: events.map((event) => ({ type: event.type, label: eventLabels[event.type], occurredAt: event.occurredAt })),
    visitor: { firstSeen: history[0]?.visitedAt ?? row.startAt, lastSeen: history.at(-1)?.visitedAt ?? row.endAt, sessions: allSessionKeys.size, pageViews: history.length, previousSessions },
  };
}
