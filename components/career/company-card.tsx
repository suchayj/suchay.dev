import type { Company } from "@prisma/client";

const label = (value: string) => value.toLowerCase().replaceAll("_", " ");

export function CompanyCard({ company }: { company: Company }) {
  return <article className={`company-card status-${company.targetStatus.toLowerCase()}`}>
    <div className="company-card-heading"><h2>{company.name}</h2><span>{label(company.targetStatus)}</span></div>
    <p>{company.categories.map(label).join(" · ")}</p>
    <div className="company-locations"><strong>Known locations</strong><span>{company.knownLocations.join(" · ") || "Not recorded"}</span></div>
    {company.targetStatus === "EXCLUDED" && <p className="company-note">Previous employer · Excluded from future targeting</p>}
  </article>;
}
