import { CompanyCard } from "@/components/career/company-card";
import { PageHeading } from "@/components/career/page-heading";
import { listCompanyUniverse } from "@/services/company-service";

export const metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const companies = await listCompanyUniverse();
  return <>
    <PageHeading eyebrow="Companies" title="Canonical target universe." description="Recognizable company names and aliases for deterministic matching. This is a candidate set, not a ranking or a claim of current openings." />
    <div className="company-list">{companies.map((company) => <CompanyCard company={company} key={company.id} />)}</div>
  </>;
}
