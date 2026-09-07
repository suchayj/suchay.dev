import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  getVisitorPagination,
  getVisitorRetentionCutoff,
  getVisitorRetentionMonths,
  resolveVisitorFilter,
  startOfIndiaDay,
  VISITOR_ORDER_BY,
  type VisitorFilterInput,
} from "@/lib/analytics/visitor-presentation";

export async function getVisitorSummary(requestedPage = 1, filterInput: VisitorFilterInput = {}) {
  const now = new Date();
  const today = startOfIndiaDay(now);
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1_000);
  const retentionMonths = getVisitorRetentionMonths();
  const retentionCutoff = getVisitorRetentionCutoff(now, retentionMonths);
  const filter = resolveVisitorFilter(filterInput, now);
  const selectedStart = filter.startAt && filter.startAt > retentionCutoff ? filter.startAt : retentionCutoff;
  const where: Prisma.PageVisitWhereInput = {
    visitedAt: { gte: selectedStart, ...(filter.endAt ? { lt: filter.endAt } : {}) },
  };
  const totalVisits = await prisma.pageVisit.count({ where });
  const pagination = getVisitorPagination(totalVisits, requestedPage);
  const [todayVisitors, weekVisitors, uniqueVisitors, sessions, topPages, recentVisits] = await Promise.all([
    prisma.pageVisit.findMany({ where: { visitedAt: { gte: today } }, select: { visitorKey: true }, distinct: ["visitorKey"] }),
    prisma.pageVisit.findMany({ where: { visitedAt: { gte: sevenDaysAgo } }, select: { visitorKey: true }, distinct: ["visitorKey"] }),
    prisma.pageVisit.groupBy({ by: ["visitorKey"], where }),
    prisma.pageVisit.groupBy({ by: ["sessionKey"], where }),
    prisma.pageVisit.groupBy({ by: ["path"], where, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 5 }),
    prisma.pageVisit.findMany({
      where,
      orderBy: [...VISITOR_ORDER_BY],
      skip: pagination.skip,
      take: pagination.pageSize,
    }),
  ]);
  return {
    todayVisitors: todayVisitors.length,
    weekVisitors: weekVisitors.length,
    selectedUniqueVisitors: uniqueVisitors.length,
    selectedSessions: sessions.length,
    topPages: topPages.map((item) => ({ path: item.path, visits: item._count._all })),
    recentVisits,
    filter,
    retention: { months: retentionMonths, cutoff: retentionCutoff },
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalVisits: pagination.totalVisits,
      totalPages: pagination.totalPages,
    },
  };
}
