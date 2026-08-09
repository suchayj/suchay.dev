import type { Metadata } from "next";
import { capabilities } from "../site-data";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = { title: "Capabilities — Suchay Janbandhu", description: "Engineering capabilities across product, architecture, full-stack systems, cloud delivery and AI workflows.", alternates: { canonical: "/capabilities" } };

export default function CapabilitiesPage() {
  return <main className="route-page" id="main-content"><SiteHeader current="/capabilities" /><section className="route-hero"><p className="eyebrow"><span /> Capabilities</p><h1>Broad enough to own the system. <em>Deep where it matters.</em></h1><p>Tools are selected around the operation, the product constraints and the behaviour the system must sustain.</p></section><section className="capability-grid route-capabilities">{capabilities.map((item, index) => <article className="capability" key={item.title}><span className="cap-number">0{index + 1}</span><h2>{item.title}</h2><p>{item.description}</p><div>{item.tools.map(tool => <span key={tool}>{tool}</span>)}</div></article>)}</section></main>;
}
