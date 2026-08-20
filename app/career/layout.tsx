import type { Metadata } from "next";
import { CareerShell } from "@/components/career/career-shell";
import { requireUser } from "@/services/auth-service";

export const metadata: Metadata = { title: { default: "CareerOS", template: "%s — CareerOS" }, robots: { index: false, follow: false } };

export default async function CareerLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <CareerShell>{children}</CareerShell>;
}
