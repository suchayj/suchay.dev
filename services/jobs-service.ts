import { JobPriority, JobStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function listJobs() {
  return prisma.job.findMany({
    orderBy: [{ priority: "desc" }, { fitScore: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDashboardData() {
  const [jobs, groupedStatuses, highPriority] = await Promise.all([
    prisma.job.findMany({
      where: { priority: JobPriority.HIGH, status: { in: [JobStatus.NEW, JobStatus.SHORTLISTED] } },
      orderBy: [{ fitScore: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.job.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.job.count({ where: { priority: JobPriority.HIGH } }),
  ]);
  const counts = Object.fromEntries(groupedStatuses.map((item) => [item.status, item._count._all]));
  return {
    priorityJobs: jobs,
    summary: {
      highPriority,
      shortlisted: counts.SHORTLISTED ?? 0,
      applied: counts.APPLIED ?? 0,
      interview: counts.INTERVIEW ?? 0,
    },
  };
}
