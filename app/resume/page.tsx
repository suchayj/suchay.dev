import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { ResumeDocument } from "./resume-document";
import "./resume.css";

const title = "Senior Full Stack Engineer Résumé — Suchay Janbandhu";
const description = "Résumé of Pune-based Senior Full Stack Engineer Suchay Janbandhu: Java, Spring Boot, React, distributed systems, product engineering and GenAI.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/resume" }, openGraph: { title, description, url: "https://suchay.dev/resume", images: ["/og.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] } };

export default function ResumePage() {
  return <main className="resume-route" id="main-content"><SiteHeader current="/resume" /><header className="resume-route-intro"><div><p className="eyebrow"><span /> Résumé</p><h2>Evidence, made <em>scannable.</em></h2><p>A concise record of enterprise engineering, independently built products and production systems.</p></div><a className="btn btn-primary" href="/resume/print" target="_blank" rel="noopener noreferrer">Download / Export PDF <span aria-hidden="true">↗</span></a></header><ResumeDocument /></main>;
}
