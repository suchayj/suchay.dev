import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../site-data";
import { SiteHeader } from "../../site-header";
import { HomeFooter } from "../../home/home-footer";
import { CaseStudyStructuredData } from "../../structured-data";
import { ProductName } from "../../product-brand";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return {};
  const title = `${project.name} Case Study — Suchay Janbandhu`;
  return { title, description: project.description, alternates: { canonical: `/work/${slug}` }, openGraph: { title, description: project.description, url: `https://suchay.dev/work/${slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630, alt: `${project.name} case study by Suchay Janbandhu` }] }, twitter: { card: "summary_large_image", title, description: project.description, images: ["/og.png"] } };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex(item => item.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  return (
    <main className="route-page case-study" id="main-content">
      <SiteHeader current="/timeline" />
      <CaseStudyStructuredData project={project} />
      <section className="case-hero">
        <div>
          <p className="eyebrow"><span /> Case study · 0{index + 1}</p>
          <ProductName as="h1" slug={project.slug} name={project.name} />
          <p className="case-proposition">{project.proposition}</p>
          <p className="case-label">Independent product · End-to-end engineering</p>
        </div>
        <div className="case-system" role="img" aria-label={`${project.name}: from understanding the problem to production delivery`}>
          <span>Problem</span><i /><span>Design</span><i /><span>Build</span><i /><span>Delivery</span>
        </div>
      </section>
      <section className="case-body">
        <div><p className="case-label">The problem</p><h2>Start with the work people need to do.</h2></div>
        <div><p>{project.problem}</p><p>{project.simpleExplanation}</p></div>
      </section>
      <section className="case-body">
        <div><p className="case-label">What I built</p><h2>{project.built}</h2></div>
        <div><p>{project.description}</p><ul>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>
      </section>
      <section className="case-body">
        <div><p className="case-label">An engineering decision</p><h2>Make the important behaviour explicit.</h2></div>
        <div><p>{project.decision}</p></div>
      </section>
      <section className="case-body">
        <div><p className="case-label">My responsibility</p><h2>Own the product beyond an individual feature.</h2></div>
        <div>
          <p>I lead this independent product from understanding the problem and shaping the design through implementation, delivery and iteration.</p>
          <p>{project.delivery}</p>
          <Link className="btn btn-primary" href="/contact">Discuss this project <span aria-hidden="true">→</span></Link>
          <p><a href={project.productUrl} target="_blank" rel="noopener noreferrer">{project.productLabel} <span aria-hidden="true">↗</span></a></p>
        </div>
      </section>
      <nav className="case-next" aria-label="Case study navigation"><Link href="/timeline">← Work Timeline</Link><Link href={`/work/${projects[(index + 1) % projects.length].slug}`}>Next: {projects[(index + 1) % projects.length].name} →</Link></nav>
      <HomeFooter />
    </main>
  );
}
