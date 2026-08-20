import { PrismaClient, JobPriority, JobSource, JobStatus } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { companies } from "./seed-data/companies";

const prisma = new PrismaClient();
const ownerEmail = "suchayj@gmail.com";
const legacyOwnerEmail = "suchayj@mail.com";

const jobs = [
  { id: "seed-full-stack-pune", company: "Product engineering team", title: "Senior Full Stack Engineer — Java / Spring / React", location: "Pune · Hybrid", status: JobStatus.NEW, priority: JobPriority.HIGH, fitScore: 91 },
  { id: "seed-genai-hyderabad", company: "AI platform team", title: "GenAI Platform Engineer — Java / Distributed Systems / AI", location: "Hyderabad · Hybrid", status: JobStatus.SHORTLISTED, priority: JobPriority.HIGH, fitScore: 88 },
  { id: "seed-platform-remote", company: "Cloud infrastructure team", title: "Backend / Platform Engineer — Kafka / Spring Boot / Cloud", location: "Remote · India", status: JobStatus.NEW, priority: JobPriority.HIGH, fitScore: 86 },
  { id: "seed-nextjs-pune", company: "Digital product studio", title: "Lead Product Engineer — Next.js / Node.js / Platform", location: "Pune · On-site", status: JobStatus.SHORTLISTED, priority: JobPriority.MEDIUM, fitScore: 82 },
];

export async function seedDatabase() {
  const [owner, legacyOwner] = await Promise.all([
    prisma.user.findUnique({ where: { email: ownerEmail } }),
    prisma.user.findUnique({ where: { email: legacyOwnerEmail } }),
  ]);
  if (legacyOwner && !owner) {
    await prisma.user.update({
      where: { id: legacyOwner.id },
      data: { email: ownerEmail, passwordHash: await hashPassword("Suchay@123") },
    });
  } else if (!owner && !legacyOwner) {
    await prisma.user.create({
      data: { email: ownerEmail, passwordHash: await hashPassword("Suchay@123") },
    });
  } else if (legacyOwner) {
    await prisma.user.delete({ where: { id: legacyOwner.id } });
  }
  for (const item of companies) {
    await prisma.company.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: { ...job, source: JobSource.MANUAL_SEED },
    });
  }
}

seedDatabase()
  .then(() => console.log("CareerOS seed is ready."))
  .finally(() => prisma.$disconnect());
