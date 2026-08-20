import { CompanyTargetStatus } from "@prisma/client";
import { prisma } from "../lib/db";

export async function listCompanyUniverse() {
  return prisma.company.findMany({ orderBy: [{ targetStatus: "asc" }, { name: "asc" }] });
}

export async function listTargetCompanies() {
  return prisma.company.findMany({
    where: { targetStatus: CompanyTargetStatus.TARGET },
    orderBy: { name: "asc" },
  });
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({ where: { id } });
}

export async function resolveCompanyName(input: string) {
  const key = normalizeCompanyName(input);
  if (!key) return null;
  const companies = await prisma.company.findMany();
  const matches = companies.filter((company) =>
    [company.name, ...company.aliases].some((value) => normalizeCompanyName(value) === key),
  );
  return matches.sort((a, b) => a.name.localeCompare(b.name))[0] ?? null;
}

export function normalizeCompanyName(value: string) {
  return value.normalize("NFKD").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "");
}
