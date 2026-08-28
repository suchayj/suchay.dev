import type { Metadata } from "next";
import { capabilityGroups } from "../site-data";
import { SiteHeader } from "../site-header";
import { HomeFooter } from "../home/home-footer";

const title = "Full Stack & AI Engineering Capabilities — Suchay Janbandhu";
const description = "Full Stack engineering across Java and Spring Boot services, React and Next.js products, Kafka and distributed systems, platform delivery and GenAI workflows.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/capabilities" }, openGraph: { title, description, url: "https://suchay.dev/capabilities", images: ["/og.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] } };

export default function CapabilitiesPage() {
  return <main className="route-page public-page" id="main-content"><SiteHeader current="/capabilities" /><section className="route-hero"><p className="eyebrow"><span /> Capabilities</p><h1>Broad enough to own the system. <em>Deep where it matters.</em></h1><p>From understanding the operation to modelling, implementation and delivery—technical choices stay grounded in the behaviour the system must sustain.</p></section><section className="capability-groups route-capabilities" aria-label="Engineering capability groups">{capabilityGroups.map((group) => <section className="capability-group" key={group.label}><p className="capability-group-label">{group.label}</p><div className="capability-list">{group.items.map((item) => <article key={item.title}><h2>{item.title}</h2><p>{item.description}</p><div>{item.evidence.map((entry) => <span key={entry}>{entry}</span>)}</div></article>)}</div></section>)}</section><HomeFooter /></main>;
}
