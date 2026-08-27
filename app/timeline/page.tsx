import type { Metadata } from "next";
import Link from "next/link";
import { careerProjects, getCompany, getProjectsForCompany, type CareerProject } from "../career-data";
import { SiteHeader } from "../site-header";
import { HomeFooter } from "../home/home-footer";
import { VocalinkBrand } from "../vocalink-brand";
import "./timeline.css";

export const metadata: Metadata = {
  title: "Work Timeline — Suchay Janbandhu",
  description: "Suchay Janbandhu's engineering journey from software foundations to enterprise systems and AI-first product engineering.",
  alternates: { canonical: "/timeline" },
  openGraph: { title: "Work Timeline — Suchay Janbandhu", description: "From software foundations to enterprise engineering and AI-first products.", url: "https://suchay.dev/timeline", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Work Timeline — Suchay Janbandhu", description: "From software foundations to enterprise engineering and AI-first products.", images: ["/og.png"] },
};

const currentCompany = getCompany("independent")!;
const barclays = getCompany("barclays")!;
const sysnik = getCompany("sysnik")!;
const rebelute = getCompany("rebelute")!;
const cygnet = getCompany("cygnet")!;

export default function TimelinePage() {
  const tweebr = careerProjects.find((project) => project.id === "tweebr")!;
  const fastrax = careerProjects.find((project) => project.id === "fastraxpos")!;
  return <main className="timeline-page" id="main-content">
    <SiteHeader current="/timeline" />
    <section className="timeline-hero timeline-shell">
      <div><p className="timeline-kicker"><span /> Now · Work Timeline</p><h1>Building production software across <em>Full Stack, Platform and GenAI.</em></h1><p className="timeline-deck">Enterprise foundations became banking platforms, then large-scale financial systems. Today, that experience shapes dependable AI-first products.</p><div className="timeline-actions"><Link className="btn btn-primary" href="/work/rentora">View selected work <span aria-hidden="true">→</span></Link><Link className="btn btn-secondary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link></div></div>
      <div className="now-signal" aria-label="Current engineering focus"><span>NOW</span><strong>Independent products</strong><i/><strong>AI-native workflows</strong><i/><strong>Production systems</strong><small>{currentCompany.period}</small></div>
    </section>

    <section className="timeline-chapter current timeline-shell" aria-labelledby="current-title">
      <ChapterMark year="2026" period={currentCompany.period} label="Current" />
      <header className="chapter-heading"><div><p className="timeline-kicker">{currentCompany.name}</p><h2 id="current-title">Dependable systems, with intelligence in the <em>right places.</em></h2></div><p>AI-first and agentic product engineering built end to end—from domain model and product interface to deployment, evaluation and human decision boundaries.</p></header>
      <div className="current-systems">{getProjectsForCompany("independent").map((project, index) => <CurrentProject project={project} index={index} key={project.id} />)}</div>
    </section>

    <section className="timeline-chapter enterprise timeline-shell" aria-labelledby="enterprise-title">
      <ChapterMark year="2021" period={barclays.period} label="Enterprise" />
      <header className="enterprise-heading"><div><p className="timeline-kicker">{barclays.role}</p><h2 id="enterprise-title">{barclays.name}</h2></div><p>Nearly four and a half years building within enterprise financial systems across event processing, identity, integrations and production delivery.</p></header>
      <div className="enterprise-records">{getProjectsForCompany("barclays").map((project, index) => <ProjectDisclosure project={project} index={index} key={project.id} />)}</div>
    </section>

    <section className="timeline-chapter sysnik timeline-shell" aria-labelledby="sysnik-title">
      <ChapterMark year="2018" period={sysnik.period} label="Banking systems" />
      <div className="mid-chapter"><header><p className="timeline-kicker">{sysnik.role} · {sysnik.location}</p><h2 id="sysnik-title">{sysnik.name}</h2><p>Banking-domain product engineering across core systems, reporting, data management and full-stack tools.</p></header><div className="project-ledger">{getProjectsForCompany("sysnik").map((project, index) => <CompactProject project={project} index={index} key={project.id} />)}</div></div>
    </section>

    <section className="timeline-chapter earlier timeline-shell" aria-labelledby="earlier-title">
      <ChapterMark year="2017" period={rebelute.period} label="Product engineering" />
      <div className="earlier-row"><div><p className="timeline-kicker">{rebelute.role} · {rebelute.location}</p><h2 id="earlier-title">{rebelute.name}</h2></div><div><strong>{tweebr.name}</strong><p>{tweebr.summary}</p><TagList items={tweebr.technologies} /></div></div>
    </section>

    <section className="timeline-chapter foundation timeline-shell" aria-labelledby="foundation-title">
      <ChapterMark year="2015" period={cygnet.period} label="Foundation" />
      <div className="foundation-row"><div><p className="timeline-kicker">{cygnet.role} · {cygnet.location}</p><h2 id="foundation-title">{cygnet.name}</h2></div><div><strong>{fastrax.name}</strong><p>{fastrax.summary}</p><TagList items={fastrax.technologies} /></div></div>
      <div className="progression" aria-label="Engineering progression"><span>Software engineering</span><i/><span>Full stack products</span><i/><span>Banking systems</span><i/><span>Enterprise engineering</span><i/><span>AI-first products</span></div>
    </section>

    <section className="timeline-closing timeline-shell"><p className="timeline-kicker">Now</p><h2>Enterprise depth.<br/><em>Product ownership.</em></h2><p>Building modern software products with teams that care about how systems behave beyond the happy path.</p><div className="timeline-actions"><Link className="btn btn-primary" href="/about">View profile <span aria-hidden="true">↗</span></Link><Link className="btn btn-secondary" href="/work/rentora">View projects <span aria-hidden="true">→</span></Link></div></section>
    <HomeFooter />
  </main>;
}

function CurrentProject({ project, index }: { project: CareerProject; index: number }) {
  const flagship = project.id === "rentora";
  return <Link className={flagship ? "flagship" : ""} href={project.href!}><span>01.{index + 1}</span><div><small>{project.shortLabel}</small><h3>{project.name}</h3><p>{project.summary}</p></div><b aria-hidden="true">↗</b>{flagship && <div className="flagship-detail"><div className="flagship-flow" aria-hidden="true"><i>Interpret</i><span/><i>Validate</i><span/><i>Plan</i><span/><i>Ready</i></div><p>Structured interpretation · domain models · deterministic reasoning · validation and regression</p></div>}</Link>;
}

function ProjectDisclosure({ project, index }: { project: CareerProject; index: number }) {
  if (!project.detail) return <article className="enterprise-record brief-record"><span className="record-number">02.{index + 1}</span><div><strong>{project.name}</strong><small>{project.shortLabel}</small></div><p>{project.summary}</p></article>;
  const sections = [["Problem", project.detail.problem], ["Architecture", project.detail.architecture], ["Interesting engineering", project.detail.engineering], ["Lessons", project.detail.lessons], ["Future documentation", project.detail.future]] as const;
  return <details className="enterprise-record" open={index === 0}><summary><span className="record-number">02.{index + 1}</span><span><strong>{project.id === "mastercard-vocalink" ? <VocalinkBrand mark /> : project.name}</strong><small>{project.shortLabel}</small></span><span className="disclosure-action"><b>Project detail</b><i aria-hidden="true" /></span></summary><div className="record-body"><div className="record-sections">{sections.map(([title, body]) => <section key={title}><h3>{title}</h3><p>{body}</p></section>)}</div><section className="record-list"><h3>Technologies</h3><TagList items={project.technologies} /></section><section className="record-list"><h3>Interview topics</h3><TagList items={project.detail.interviewTopics} /></section>{project.id === "mastercard-vocalink" && <div className="retry-flow" aria-label="Immediate retry and recovery-topic path"><span>API retry</span><i/><span>Retries exhausted</span><i/><span>feedback-retry</span><i/><span>Scheduled recovery</span></div>}</div></details>;
}

function CompactProject({ project, index }: { project: CareerProject; index: number }) { return <article><span>03.{index + 1}</span><div><small>{project.shortLabel}</small><h3>{project.name}</h3><p>{project.summary}</p><TagList items={project.technologies} /></div></article>; }
function TagList({ items }: { items: readonly string[] }) { return <ul className="timeline-tags">{items.map((item) => <li key={item}>{item}</li>)}</ul>; }
function ChapterMark({ year, period, label }: { year: string; period: string; label: string }) { return <div className="chapter-mark"><span><b>{year}</b> / {label}</span><small>{period}</small></div>; }
