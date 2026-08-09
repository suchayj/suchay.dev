import type { Metadata } from "next";
import Link from "next/link";
import { capabilityNarratives, journey, systems } from "./about-data";
import { PhotoFrame } from "./photo-frame";
import { SiteHeader } from "../site-header";
import "./about.css";

export const metadata: Metadata = {
  title: "About Suchay Janbandhu — Engineer, Product Builder",
  description: "How Suchay Janbandhu approaches product engineering, enterprise systems, cloud delivery and AI-enabled workflows.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Suchay Janbandhu", description: "A visual engineering biography: from enterprise foundations to complete products and AI-enabled systems.", url: "https://suchay.dev/about", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "About Suchay Janbandhu", description: "A visual engineering biography of Suchay Janbandhu.", images: ["/og.png"] },
};

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function AboutPage() {
  return (
    <main className="about-page" id="main-content">
      <SiteHeader current="/about" dark />

      <section className="about-hero about-shell">
        <div className="about-hero-copy">
          <p className="about-kicker"><span /> About Suchay</p>
          <h1>I enjoy turning ambiguous, operational problems into software that people can <em>actually depend on.</em></h1>
          <p className="about-intro">I’m a full-stack engineer based in Pune, working across enterprise platforms, product architecture, modern web applications, cloud-native delivery and AI-enabled workflows.</p>
          <p className="about-availability"><i /> Available to join within 15 days</p>
        </div>
        <div className="hero-architecture" role="img" aria-label="A system diagram connecting product architecture, engineering, AI workflows and production">
          <span className="architecture-label">System perspective / 01</span>
          <div className="architecture-node node-product"><small>01</small><strong>Product</strong><span>Operation → model</span></div>
          <div className="architecture-node node-system"><small>02</small><strong>Architecture</strong><span>Boundaries + state</span></div>
          <div className="architecture-node node-build"><small>03</small><strong>Engineering</strong><span>Web + platforms</span></div>
          <div className="architecture-node node-ai"><small>04</small><strong>AI workflow</strong><span>Useful intelligence</span></div>
          <div className="architecture-node node-live"><small>05</small><strong>Production</strong><span>Reliable operation</span></div>
          <i className="architecture-line line-one"/><i className="architecture-line line-two"/><i className="architecture-line line-three"/><i className="architecture-line line-four"/>
          <p>Architecture through operation<br/><b>End-to-end ownership</b></p>
        </div>
      </section>

      <section className="statement about-shell">
        <blockquote>“I care about what happens <em>after the interface:</em> state, correctness, deployment, recovery and whether the workflow genuinely works.”</blockquote>
        <div className="statement-body">
          <p className="about-kicker"><span /> A working philosophy</p>
          <p>Start with the real operation: the people involved, the decisions they make and the conditions under which the system can fail. From there, create explicit domain and state models that make behaviour easier to reason about.</p>
          <p>Build end to end instead of treating frontend, backend and delivery as disconnected concerns. Deployment and production behaviour belong to the product. AI belongs where it improves a human workflow—and consequential actions should keep a human in control.</p>
        </div>
      </section>

      <section className="journey about-shell" aria-labelledby="journey-title">
        <div className="journey-heading"><p className="about-kicker"><span /> Engineering journey</p><h2 id="journey-title">An expanding view of <em>what ownership means.</em></h2></div>
        <div className="journey-list">
          {journey.map((stage, index) => (
            <article className={`journey-stage stage-${index + 1}`} key={stage.title}>
              <div className="journey-copy"><div className="stage-meta"><span>{stage.index}</span><span>{stage.period}</span></div><h3>{stage.title}</h3><p className="stage-lead">{stage.body}</p><p>{stage.detail}</p></div>
              {"image" in stage ? <PhotoFrame src={stage.image} alt={stage.alt} label={`${stage.period} / ${stage.index}`} sizes="(max-width: 760px) 100vw, 44vw" objectPosition={stage.position} /> : <div className="current-system-visual" role="img" aria-label="Product architecture flowing through engineering and AI into production"><div><span>Product</span><i /></div><div><span>Architecture</span><i /></div><div><span>Engineering</span><i /></div><div><span>AI workflow</span><i /></div><div><span>Production</span></div></div>}
            </article>
          ))}
        </div>
      </section>

      <section className="about-systems about-shell" id="about-work">
        <div className="systems-intro"><p className="about-kicker"><span /> Selected systems</p><h2>Products shaped around <em>real operations.</em></h2><p>Four systems that reflect the progression from domain modelling to dependable delivery.</p></div>
        <div className="system-list">
          {systems.map((system) => <article key={system.name}><div className="system-id"><span>{system.index}</span><div className="mini-architecture" aria-hidden="true"><i/><i/><i/></div></div><div><h3>{system.name}</h3><p className="system-proposition">{system.proposition}</p></div><div><p>{system.description}</p><ul>{system.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div></article>)}
        </div>
      </section>

      <section className="context about-shell" aria-labelledby="context-title">
        <div className="context-heading"><p className="about-kicker"><span /> Capabilities in context</p><h2 id="context-title">Tools follow the <em>shape of the problem.</em></h2></div>
        <ol>{capabilityNarratives.map(item => <li key={item.title}><span>{item.index}</span><h3>{item.title}</h3><p>{item.body}</p></li>)}</ol>
      </section>

      <section className="beyond about-shell">
        <PhotoFrame src="/images/about/beach-goggle.jpg" alt="Suchay smiling beside the water in sunglasses" label="Beyond the code" sizes="(max-width: 760px) 100vw, 48vw" objectPosition="50% 28%" />
        <div><p className="about-kicker"><span /> Beyond the code</p><h2>Perspective comes from <em>looking beyond the screen.</em></h2><p>Good engineering is only one part of a good life. Outside software, I value fitness, wildlife, travel, music and the perspective that comes from exploring interests beyond a screen.</p><ul><li>Product thinking</li><li>Continuous learning</li><li>Fitness & discipline</li><li>Wildlife & exploration</li><li>Music & creative interests</li></ul></div>
      </section>

      <section className="about-closing about-shell" id="about-contact">
        <p className="about-kicker"><span /> Start a conversation</p>
        <h2>I’m interested in difficult systems, meaningful products and teams that care about how software <em>behaves in the real world.</em></h2>
        <div className="closing-actions"><a className="closing-email" href="mailto:suchayj@gmail.com">suchayj@gmail.com <Arrow /></a><Link className="btn btn-primary" href="/work">View selected work <span aria-hidden="true">→</span></Link></div>
        <div className="closing-meta"><div><small>Location</small><span>Pune, India</span></div><div><small>Availability</small><span>Within 15 days</span></div><div><small>Phone</small><a href="tel:+918007778797">+91 80077 78797</a></div><div><small>Elsewhere</small><span><a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub <Arrow /></a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a></span></div></div>
      </section>
      <footer className="about-footer"><span>© {new Date().getFullYear()} Suchay Janbandhu</span><Link href="/">suchay.dev</Link><div><a href="https://github.com/suchayj">GitHub</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/">LinkedIn</a></div></footer>
    </main>
  );
}
