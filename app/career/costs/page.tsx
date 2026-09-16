import { prisma } from "@/lib/db";
import { requireUser } from "@/services/auth-service";
import { PageHeading } from "@/components/career/page-heading";
import { CallCosts } from "@/components/career/call-costs";
import type { CostLine } from "@/lib/voice/costs";
export const dynamic = "force-dynamic";
export const metadata = { title: "Call costs" };
export default async function CostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireUser();
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const since = new Date(new Date().getTime() - 30 * 86400000);
  const where = { startedAt: { gte: since } };
  const [calls, totalCalls, sum, unpricedEvents] = await Promise.all([
    prisma.voiceEnquiry.findMany({ where, orderBy: [{ startedAt: "desc" }, { id: "desc" }], take: 20, skip: (page - 1) * 20, include: { usageEvents: { orderBy: { createdAt: "asc" } } } }),
    prisma.voiceEnquiry.count({ where }),
    prisma.voiceUsage.aggregate({ where: { enquiry: where }, _sum: { costUsd: true } }),
    prisma.voiceUsage.count({ where: { enquiry: where, costUsd: null } }),
  ]);
  return <><PageHeading eyebrow="Call costs" title="Know what each conversation costs." description="Recorded usage, an itemised cost for every call, and a simple calculator for planning ahead." /><CallCosts calls={calls.map(call => ({ id: call.id, name: call.name, date: (call.startedAt ?? call.createdAt).toISOString(), state: call.state, tracked: call.costTrackingVersion !== null,
    seconds: call.startedAt && call.endedAt ? Math.max(0, Math.round((call.endedAt.getTime() - call.startedAt.getTime()) / 1000)) : null,
    events: call.usageEvents.map(event => ({ kind: event.kind, model: event.model, usd: event.costUsd === null ? null : Number(event.costUsd), issue: event.issue, rateVersion: event.rateVersion, lines: event.lineItems as unknown as CostLine[] })),
  }))} totalUsd={Number(sum._sum.costUsd ?? 0)} totalCalls={totalCalls} unpricedEvents={unpricedEvents} page={page} hasNext={page * 20 < totalCalls} /></>;
}
