import { prisma } from "../lib/db";
import { runVisitorRetention } from "../services/analytics/visitor-retention";

const result = await runVisitorRetention({ dryRun: true });
console.log(JSON.stringify({
  ...result,
  cutoff: result.cutoff.toISOString(),
  note: "Dry run only. PageVisit and VisitorEvent have no dependent records; no rows were changed.",
}, null, 2));
await prisma.$disconnect();
