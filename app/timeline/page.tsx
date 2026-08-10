import type { Metadata } from "next";
import { SiteNavLink } from "../site-nav-link";
import { SiteHeader } from "../site-header";
import "./timeline.css";

export const metadata: Metadata = {
  title: "Engineering Journey — Suchay Janbandhu",
  description: "Suchay Janbandhu's engineering journey from AI-first product engineering through enterprise systems and foundational practice.",
  alternates: { canonical: "/timeline" },
  openGraph: { title: "Engineering Journey — Suchay Janbandhu", description: "From AI-first products to enterprise engineering foundations.", url: "https://suchay.dev/timeline", images: ["/og.png"] },
};

type ProjectRecord = {
  name: string;
  label: string;
  problem: string;
  architecture: string;
  technologies: readonly string[];
  engineering: string;
  lessons: string;
  interviewTopics: readonly string[];
  future: string;
  status?: string;
};

const enterpriseProjects: readonly ProjectRecord[] = [
  {
    name: "Mastercard Vocalink",
    label: "Event processing / Fraud workflows",
    problem: "Fraud-detection events need dependable processing even when downstream work fails or must be retried.",
    architecture: "Event-driven integration using Apache Kafka, explicit retry handling and Dead Letter Queue paths.",
    technologies: ["Java", "Spring Boot", "Kafka", "Event Driven Architecture", "Dead Letter Queue"],
    engineering: "Worked extensively on resilient event processing, retry mechanisms and failure isolation within Mastercard Vocalink integrations.",
    lessons: "Failure paths, replay behaviour and operational visibility are part of the workflow—not secondary infrastructure concerns.",
    interviewTopics: ["Kafka delivery semantics", "Idempotency", "Retry strategy", "DLQ operations", "Failure recovery"],
    future: "Verified sequence diagrams and deeper implementation context will be added as documentation is completed.",
  },
  {
    name: "Identification & Verification",
    label: "Identity / Multi-channel journeys",
    problem: "Authentication and verification journeys must remain coherent across multiple enterprise channels.",
    architecture: "Enterprise identity and verification capabilities exposed through secured service and API boundaries.",
    technologies: ["Identity", "Authentication", "Enterprise APIs", "Security"],
    engineering: "Worked on systems supporting authentication and login journeys across multiple channels.",
    lessons: "Identity workflows require explicit trust boundaries, predictable responses and careful treatment of failure states.",
    interviewTopics: ["Authentication flows", "API security", "Channel consistency", "Trust boundaries"],
    future: "Channel-specific flows and verified architecture detail will be added when documentation is ready.",
  },
  {
    name: "Amazon Connect",
    label: "Voice systems / AI",
    status: "Exact service implementation name pending confirmation.",
    problem: "Customer interaction through voice systems requires reliable routing and recognition within a controlled service journey.",
    architecture: "An Amazon Connect based customer-interaction and voice-recognition system.",
    technologies: ["Amazon Connect", "Voice Systems", "AI"],
    engineering: "Worked on the system while the exact internal service terminology remains pending confirmation.",
    lessons: "Voice interfaces need observable transitions and clear fallback behaviour because the interface itself is transient.",
    interviewTopics: ["Voice workflows", "Interaction routing", "Recognition boundaries", "Fallback design"],
    future: "Project terminology will be expanded as documentation is completed.",
  },
  {
    name: "BIDV",
    label: "Platform record / Documentation in progress",
    problem: "Verified problem context is still being documented.",
    architecture: "Architecture detail is intentionally withheld until it can be documented accurately.",
    technologies: [],
    engineering: "Documentation in progress.",
    lessons: "No claims are published before the supporting project context is verified.",
    interviewTopics: ["To be documented"],
    future: "This record is structured for future problem, architecture and engineering detail.",
  },
];

const currentProjects = [
  { name: "Rentora", badge: "Flagship · AI-first Operations OS", description: "Natural-language requirements become structured inventory, crew, logistics and operational plans.", href: "/work/rentora", flagship: true },
  { name: "Edvora", badge: "School Operating System", description: "Academic and administrative workflows brought into one coherent school operations platform.", href: "/work/edvora", flagship: false },
  { name: "Streamora", badge: "Private Media Platform", description: "Secure uploads, processing, metadata and signed access designed as production infrastructure.", href: "/work/streamora", flagship: false },
  { name: "Loom", badge: "Deployment Platform", description: "Immutable releases, health verification and environment governance in one delivery path.", href: "/work/loom", flagship: false },
] as const;

const research = ["Agentic AI", "LLMs", "MCP", "Workflow Automation", "AI-assisted Product Development", "System Architecture", "Production Engineering", "Knowledge Systems"];

export default function TimelinePage() {
  return (
    <main className="timeline-page" id="main-content">
      <SiteHeader current="/timeline" />

      <section className="timeline-hero timeline-shell">
        <div>
          <p className="timeline-kicker"><span /> Now · Engineering journey</p>
          <h1>Building at the edge of <em>AI‑native product engineering.</em></h1>
          <p className="timeline-deck">The newest work comes first. Enterprise experience and earlier foundations provide the context beneath it.</p>
          <div className="timeline-actions"><SiteNavLink className="btn btn-primary" href="/work">View selected work <span aria-hidden="true">→</span></SiteNavLink><SiteNavLink className="btn btn-secondary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></SiteNavLink></div>
        </div>
        <div className="now-signal" aria-label="Current engineering focus"><span>NOW</span><strong>Product architecture</strong><i/><strong>Agentic workflows</strong><i/><strong>Production systems</strong><small>March 2026 — Present</small></div>
      </section>

      <section className="timeline-chapter current timeline-shell" aria-labelledby="current-title">
        <ChapterMark number="01" period="March 2026 — Present" label="Current" />
        <header className="chapter-heading">
          <div><p className="timeline-kicker">Independent Product Engineering</p><h2 id="current-title">Products are where the ideas become <em>real systems.</em></h2></div>
          <div className="chapter-narrative"><p>The focus shifted towards understanding how modern AI systems can become useful, deployable software products.</p><p>Product architecture, LLMs, agentic workflows, orchestration and production engineering now move as one discipline.</p></div>
        </header>
        <div className="current-systems">
          {currentProjects.map((project, index) => (
            <SiteNavLink className={project.flagship ? "flagship" : ""} href={project.href} key={project.name}>
              <span>01.{index + 1}</span><div><small>{project.badge}</small><h3>{project.name}</h3><p>{project.description}</p></div><b aria-hidden="true">↗</b>
              {project.flagship && <div className="flagship-flow" aria-hidden="true"><i>Intent</i><span/><i>Plan</i><span/><i>Operate</i></div>}
            </SiteNavLink>
          ))}
        </div>
      </section>

      <section className="timeline-chapter research timeline-shell" aria-labelledby="research-title">
        <ChapterMark number="02" period="Active exploration" label="AI-native systems" />
        <header className="chapter-heading"><div><p className="timeline-kicker">Research in practice</p><h2 id="research-title">A connected field of <em>engineering questions.</em></h2></div><p>The work connects intelligence, orchestration and production discipline—not as trends, but as parts of one product system.</p></header>
        <div className="research-map" role="img" aria-label="Interconnected map of current engineering research">
          <div className="research-core"><small>Active focus</small><strong>AI-native<br/>systems</strong></div>
          {research.map((topic, index) => <div className={`research-node research-node-${index + 1}`} key={topic}><span>R{String(index + 1).padStart(2, "0")}</span><strong>{topic}</strong></div>)}
          <i className="research-path path-a"/><i className="research-path path-b"/><i className="research-path path-c"/><i className="research-path path-d"/>
        </div>
      </section>

      <section className="timeline-chapter enterprise timeline-shell" aria-labelledby="enterprise-title">
        <ChapterMark number="03" period="October 2021 — March 2026" label="Enterprise" />
        <details className="barclays-chapter" open>
          <summary><div><p className="timeline-kicker">Enterprise Engineering</p><h2 id="enterprise-title">Barclays</h2></div><span><b>Explore chapter</b><i aria-hidden="true" /></span></summary>
          <div className="barclays-intro"><p>Large-scale systems shaped by resilient integration, identity journeys, event-driven processing and customer interaction platforms.</p><small>Select a project to inspect the engineering record.</small></div>
          <div className="enterprise-records">
            {enterpriseProjects.map((project, index) => <ProjectDisclosure project={project} index={index} key={project.name} />)}
          </div>
        </details>
      </section>

      <section className="timeline-chapter foundations timeline-shell" aria-labelledby="foundations-title">
        <ChapterMark number="04" period="Before October 2021" label="Earlier context" />
        <div className="foundation-layout">
          <div className="chapter-copy"><p className="timeline-kicker">Foundations</p><h2 id="foundations-title">Learning how production software <em>holds together.</em></h2><p>The focus was on software engineering fundamentals, backend development, Java, enterprise development practices and understanding production software.</p></div>
          <SystemStrip labels={["Java", "Backend", "Enterprise practice", "Production"]} />
        </div>
      </section>

      <section className="timeline-closing timeline-shell">
        <p className="timeline-kicker">The work continues</p><h2>Strong fundamentals.<br/><em>AI-native workflows.</em></h2><p>Looking for opportunities to build modern software products with teams that care about how systems behave in the real world.</p><p className="next-availability"><i /> Available within 15 days</p><div className="timeline-actions"><SiteNavLink className="btn btn-primary" href="/about">View profile <span aria-hidden="true">↗</span></SiteNavLink><SiteNavLink className="btn btn-secondary" href="/work">View projects <span aria-hidden="true">→</span></SiteNavLink></div>
      </section>
    </main>
  );
}

function ProjectDisclosure({ project, index }: { project: ProjectRecord; index: number }) {
  const sections = [
    ["Problem", project.problem], ["Architecture", project.architecture], ["Interesting engineering", project.engineering], ["Lessons", project.lessons], ["Future documentation", project.future],
  ] as const;
  return <details className="enterprise-record" open={index === 0}>
    <summary><span className="record-number">03.{index + 1}</span><span><strong>{project.name}</strong><small>{project.label}</small></span><span className="disclosure-action"><b>Project detail</b><i aria-hidden="true" /></span></summary>
    <div className="record-body">
      {project.status && <p className="record-status">Status / {project.status}</p>}
      <div className="record-sections">{sections.map(([title, body]) => <section key={title}><h3>{title}</h3><p>{body}</p></section>)}</div>
      <section className="record-list"><h3>Technologies</h3>{project.technologies.length ? <ul>{project.technologies.map(item => <li key={item}>{item}</li>)}</ul> : <p>Documentation in progress.</p>}</section>
      <section className="record-list"><h3>Interview topics</h3><ul>{project.interviewTopics.map(item => <li key={item}>{item}</li>)}</ul></section>
    </div>
  </details>;
}

function ChapterMark({ number, period, label }: { number: string; period: string; label: string }) { return <div className="chapter-mark"><span>{number} / {label}</span><small>{period}</small></div>; }
function SystemStrip({ labels }: { labels: readonly string[] }) { return <div className="system-strip" role="img" aria-label={labels.join(" to ")}>{labels.map((label, index) => <div key={label}><span>{label}</span>{index < labels.length - 1 && <i aria-hidden="true" />}</div>)}</div>; }
