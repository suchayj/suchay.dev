import { prisma } from "@/lib/db";
import { getVisitorRetentionCutoff, getVisitorRetentionMonths } from "@/lib/analytics/visitor-presentation";

export type VisitorRetentionResult = {
  dryRun: boolean;
  retentionMonths: number;
  cutoff: Date;
  eligibleRecords: number;
  eligibleEvents: number;
  deletedRecords: number;
  deletedEvents: number;
  remainingEligibleRecords: number;
  remainingEligibleEvents: number;
};

export async function runVisitorRetention({
  dryRun = true,
  batchSize = 500,
  now = new Date(),
}: { dryRun?: boolean; batchSize?: number; now?: Date } = {}): Promise<VisitorRetentionResult> {
  const retentionMonths = getVisitorRetentionMonths();
  const cutoff = getVisitorRetentionCutoff(now, retentionMonths);
  const [eligibleRecords, eligibleEvents] = await Promise.all([
    prisma.pageVisit.count({ where: { visitedAt: { lt: cutoff } } }),
    prisma.visitorEvent.count({ where: { occurredAt: { lt: cutoff } } }),
  ]);

  if (dryRun || (eligibleRecords === 0 && eligibleEvents === 0)) {
    return { dryRun, retentionMonths, cutoff, eligibleRecords, eligibleEvents, deletedRecords: 0, deletedEvents: 0, remainingEligibleRecords: eligibleRecords, remainingEligibleEvents: eligibleEvents };
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
  const eventBatch = await prisma.visitorEvent.findMany({ where: { occurredAt: { lt: cutoff } }, orderBy: [{ occurredAt: "asc" }, { id: "asc" }], select: { id: true }, take: boundedBatchSize });
  const deletedEventResult = eventBatch.length ? await prisma.visitorEvent.deleteMany({ where: { id: { in: eventBatch.map(({ id }) => id) } } }) : { count: 0 };

  return {
    dryRun: false,
    retentionMonths,
    cutoff,
    eligibleRecords,
    eligibleEvents,
    deletedRecords: deleted.count,
    deletedEvents: deletedEventResult.count,
    remainingEligibleRecords: Math.max(0, eligibleRecords - deleted.count),
    remainingEligibleEvents: Math.max(0, eligibleEvents - deletedEventResult.count),
  };
}
