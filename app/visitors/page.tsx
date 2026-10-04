import { OwnerDevices } from "@/components/analytics/owner-devices";
import { VisitorIntelligence } from "@/components/analytics/visitor-intelligence";
import { PageHeading } from "@/components/career/page-heading";
import { getSessionIntelligence } from "@/services/analytics/session-intelligence";
import { requireUser } from "@/services/auth-service";
import { getOwnerDevices } from "@/services/owner-devices";

export default async function VisitorsPage() {
  await requireUser();
  const [visitorSummary, ownerDevices] = await Promise.all([
    getSessionIntelligence(), getOwnerDevices(),
  ]);
  return <>
    <PageHeading eyebrow="Portfolio analytics" title="Visitors" description="Visits, approximate locations and browsing activity across your portfolio." />
    <VisitorIntelligence initialData={visitorSummary} />
    <OwnerDevices data={ownerDevices} />
  </>;
}
