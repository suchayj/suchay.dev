import type { Metadata } from "next";
import { PrintButton } from "../print-button";
import { ResumeDocument } from "../resume-document";
import "../resume.css";

export const metadata: Metadata = { title: "Print Résumé — Suchay Janbandhu", robots: { index: false, follow: false } };

export default function PrintResumePage() {
  return <main className="resume-print-route"><div className="resume-print-toolbar"><div><strong>Résumé ready</strong><span>Choose “Save as PDF” in the print dialog.</span></div><PrintButton /></div><ResumeDocument /></main>;
}
