import { prisma } from "@/lib/db";
import { getVisitorRetentionCutoff, getVisitorRetentionMonths } from "@/lib/analytics/visitor-presentation";

export type VisitorRetentionResult = {
  dryRun: boolean;
  retentionMonths: number;
  cutoff: Date;
  eligibleRecords: number;
  deletedRecords: number;
  remainingEligibleRecords: number;
};

export async function runVisitorRetention({
  dryRun = true,
  batchSize = 500,
  now = new Date(),
}: { dryRun?: boolean; batchSize?: number; now?: Date } = {}): Promise<VisitorRetentionResult> {
  const retentionMonths = getVisitorRetentionMonths();
  const cutoff = getVisitorRetentionCutoff(now, retentionMonths);
  const eligibleRecords = await prisma.pageVisit.count({ where: { visitedAt: { lt: cutoff } } });

  if (dryRun || eligibleRecords === 0) {
    return { dryRun, retentionMonths, cutoff, eligibleRecords, deletedRecords: 0, remainingEligibleRecords: eligibleRecords };
  }

  const boundedBatchSize = Math.min(Math.max(1, Math.trunc(batchSize)), 5_000);
  const batch = await prisma.pageVisit.findMany({
    where: { visitedAt: { lt: cutoff } },
    orderBy: [{ visitedAt: "asc" }, { id: "asc" }],
    select: { id: true },
    take: boundedBatchSize,
  });
  const deleted = batch.length
    ? await prisma.pageVisit.deleteMany({ where: { id: { in: batch.map(({ id }) => id) } } })
    : { count: 0 };

  return {
    dryRun: false,
    retentionMonths,
    cutoff,
    eligibleRecords,
    deletedRecords: deleted.count,
    remainingEligibleRecords: Math.max(0, eligibleRecords - deleted.count),
  };
}
