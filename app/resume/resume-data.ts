import { careerProjects, companies, education, getCareerProject, getCompany } from "../career-data";

function requireCompany(id: string) {
  const company = getCompany(id);
  if (!company) throw new Error(`Missing career company: ${id}`);
  return company;
}

function requireProject(id: string) {
  const project = getCareerProject(id);
  if (!project) throw new Error(`Missing career project: ${id}`);
  return project;
}

export const resumeFacts = {
  independent: requireCompany("independent"),
  barclays: requireCompany("barclays"),
  sysnik: requireCompany("sysnik"),
  rebelute: requireCompany("rebelute"),
  cygnet: requireCompany("cygnet"),
  rentora: requireProject("rentora"),
  edvora: requireProject("edvora"),
  loom: requireProject("loom"),
  vocalink: requireProject("mastercard-vocalink"),
  bidv: requireProject("barclays-identification-verification"),
  amazonConnect: requireProject("amazon-connect-voice"),
  sysnikProjects: [
    requireProject("master-table-management"),
    requireProject("syscore-cbs"),
    requireProject("reporting-framework"),
    requireProject("ui-builder"),
  ],
  tweebr: requireProject("tweebr"),
  fastrax: requireProject("fastraxpos"),
  education: education[0],
} as const;

// Fail loudly if the public Barclays hierarchy ever drifts from the canonical model.
const barclaysProjects = careerProjects.filter((project) => project.companyId === "barclays" && project.public);
if (barclaysProjects.length !== 3 || resumeFacts.barclays.projectIds.length !== 3) {
  throw new Error("The public Barclays career hierarchy must contain exactly three projects.");
}

if (companies.filter((company) => company.id === "barclays").length !== 1) {
  throw new Error("The Barclays company record must be canonical.");
}

export const contact = {
  location: "Pune, India",
  email: "suchayj@gmail.com",
  phoneLabel: "+91 80077 78797",
  phoneHref: "+918007778797",
  website: "suchay.dev",
  github: "github.com/suchayj",
  linkedin: "linkedin.com/in/suchay-janbandhu-9a014779",
} as const;
