import type { Metadata } from "next";
import { SiteNavLink } from "../site-nav-link";
import { projects } from "../site-data";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = { title: "Selected Work — Suchay Janbandhu", description: "Product systems designed and engineered by Suchay Janbandhu.", alternates: { canonical: "/work" } };

export default function WorkPage() {
  return <main className="route-page" id="main-content"><SiteHeader current="/work" /><section className="route-hero"><p className="eyebrow"><span /> Selected work</p><h1>Systems built around how work <em>actually happens.</em></h1><p>Four product platforms shaped by operational detail, explicit architecture and dependable delivery.</p></section><section className="route-list" aria-label="Case studies">{projects.map((project, index) => <SiteNavLink className="route-project" href={`/work/${project.slug}`} key={project.slug}><span>0{index + 1}</span><div><h2>{project.name}</h2><p>{project.proposition}</p></div><strong>Open case study →</strong></SiteNavLink>)}</section></main>;
}
