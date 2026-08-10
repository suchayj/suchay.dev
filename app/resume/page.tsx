import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { ResumeDocument } from "./resume-document";
import "./resume.css";

export const metadata: Metadata = { title: "Résumé — Suchay Janbandhu", description: "Résumé of Suchay Janbandhu, Senior Full Stack Engineer with 10+ years across enterprise systems, product engineering and GenAI.", alternates: { canonical: "/resume" } };

export default function ResumePage() {
  return <main className="resume-route" id="main-content"><SiteHeader current="/resume" /><header className="resume-route-intro"><div><p className="eyebrow"><span /> Résumé</p><h2>Evidence, made <em>scannable.</em></h2><p>A concise record of enterprise engineering, independently built products and production systems.</p></div><a className="btn btn-primary" href="/resume/print" target="_blank" rel="noopener noreferrer">Download / Export PDF <span aria-hidden="true">↗</span></a></header><ResumeDocument /></main>;
}
