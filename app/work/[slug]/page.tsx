import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../site-data";
import { SiteHeader } from "../../site-header";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return {};
  return { title: `${project.name} Case Study — Suchay Janbandhu`, description: project.description, alternates: { canonical: `/work/${slug}` } };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex(item => item.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  return <main className="route-page case-study" id="main-content"><SiteHeader current="/work" /><section className="case-hero"><div><p className="eyebrow"><span /> Case study · 0{index + 1}</p><h1>{project.name}</h1><p className="case-proposition">{project.proposition}</p></div><div className="case-system" role="img" aria-label={`${project.name} system overview`}><span>Problem</span><i /><span>Model</span><i /><span>Workflow</span><i /><span>Production</span></div></section><section className="case-body"><div><p className="case-label">Overview</p><h2>A concise view while the full case study is being prepared.</h2></div><div><p>{project.description}</p><p>This page establishes a permanent, shareable home for the work without inventing outcomes, screenshots or metrics. Architecture decisions, delivery context and verified product detail will be added here as they are ready.</p><ul>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div></section><nav className="case-next" aria-label="Case study navigation"><Link href="/work">← All work</Link><Link href={`/work/${projects[(index + 1) % projects.length].slug}`}>Next: {projects[(index + 1) % projects.length].name} →</Link></nav></main>;
}
