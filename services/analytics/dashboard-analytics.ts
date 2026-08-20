import { prisma } from "@/lib/db";

export async function getVisitorSummary() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const [todayVisitors, weekVisitors, topPages, recentVisits] = await Promise.all([
    prisma.pageVisit.findMany({ where: { visitedAt: { gte: today } }, select: { visitorKey: true }, distinct: ["visitorKey"] }),
    prisma.pageVisit.findMany({ where: { visitedAt: { gte: sevenDaysAgo } }, select: { visitorKey: true }, distinct: ["visitorKey"] }),
    prisma.pageVisit.groupBy({ by: ["path"], where: { visitedAt: { gte: sevenDaysAgo } }, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 5 }),
    prisma.pageVisit.findMany({ orderBy: { visitedAt: "desc" }, take: 6 }),
  ]);
  return {
    todayVisitors: todayVisitors.length,
    weekVisitors: weekVisitors.length,
    topPages: topPages.map((item) => ({ path: item.path, visits: item._count._all })),
    recentVisits,
  };
}
