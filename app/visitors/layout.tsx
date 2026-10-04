import type { Metadata } from "next";
import { CareerShell } from "@/components/career/career-shell";
import { requireUser } from "@/services/auth-service";

export const metadata: Metadata = {
  title: "Visitors — Suchay Janbandhu",
  robots: { index: false, follow: false },
};

export default async function VisitorsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <CareerShell>{children}</CareerShell>;
}
