import type { Metadata } from "next";
import { capabilities, projects } from "./site-data";

export const metadata: Metadata = {
  title: "Suchay Janbandhu — Senior Full Stack Engineer",
  description:
    "Senior Full Stack Engineer based in Pune, building enterprise platforms, modern web products, cloud-native systems and AI-enabled software.",
};

const Arrow = () => <span aria-hidden="true">↗</span>;

function SystemVisual({ index }: { index: number }) {
  const labels = [
    ["Workflows", "Shared state", "Operations"],
    ["Language", "Planning", "Readiness"],
    ["Upload", "Process", "Private access"],
    ["Source", "Release", "Verify"],
  ][index];

  return (
    <div className={`project-visual visual-${index + 1}`} aria-hidden="true">
      <div className="visual-index">0{index + 1}</div>
      <div className="visual-flow">
        {labels.map((label, itemIndex) => (
          <div className="flow-step" key={label}>
            <span className="flow-dot" />
            <span>{label}</span>
            {itemIndex < labels.length - 1 && <i />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Suchay Janbandhu, home">
          Suchay<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#capabilities">Capabilities</a>
          <a href="/about">About</a>
          <a className="nav-contact" href="#contact">Contact <Arrow /></a>
        </nav>
      </header>

      <section className="hero section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Suchay Janbandhu · Pune</p>
          <h1>I build software that moves from complex ideas to <em>reliable production systems.</em></h1>
          <p className="hero-intro">Senior Full Stack Engineer working across enterprise platforms, modern web applications, cloud-native delivery and AI-enabled products.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">View selected work <span aria-hidden="true">↓</span></a>
            <a className="button button-secondary" href="mailto:suchayj@gmail.com">Contact me <Arrow /></a>
          </div>
          <div className="hero-meta" aria-label="Profile links and availability">
            <span className="availability"><i /> Available within 15 days</span>
            <a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
            <a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
          </div>
        </div>

        <div className="system-map" aria-label="A system map showing product ideas moving through architecture, engineering and AI into production">
          <div className="map-label map-label-top">System / 01</div>
          <div className="map-node map-product"><span>01</span><strong>Product</strong><small>Ambiguity → clarity</small></div>
          <div className="map-node map-architecture"><span>02</span><strong>Architecture</strong><small>Boundaries + state</small></div>
          <div className="map-node map-engineering"><span>03</span><strong>Engineering</strong><small>Web + platforms</small></div>
          <div className="map-node map-ai"><span>04</span><strong>AI</strong><small>Useful intelligence</small></div>
          <div className="map-node map-production"><span>05</span><strong>Production</strong><small>Reliable operation</small></div>
          <div className="map-line line-a" /><div className="map-line line-b" /><div className="map-line line-c" /><div className="map-line line-d" />
          <div className="map-pulse pulse-a" /><div className="map-pulse pulse-b" />
          <div className="map-caption"><span>Architecture → operation</span><b>End-to-end ownership</b></div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="section-heading">
          <p className="eyebrow"><span /> Selected work</p>
          <h2>Systems built around how work <em>actually happens.</em></h2>
          <p>Product platforms shaped by operational detail, explicit architecture and the realities of production.</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article className="project-card" key={project.name}>
              <SystemVisual index={index} />
              <div className="project-body">
                <div className="project-title"><h3>{project.name}</h3><span>0{index + 1}</span></div>
                <p className="project-proposition">{project.proposition}</p>
                <p className="project-description">{project.description}</p>
                <ul className="tags" aria-label={`${project.name} capabilities`}>
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                <span className="coming-soon">Case study coming soon <span aria-hidden="true">→</span></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="capabilities section" id="capabilities">
        <div className="section-heading compact">
          <p className="eyebrow"><span /> Capabilities</p>
          <h2>Broad enough to own the system. <em>Deep where it matters.</em></h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability, index) => (
            <article className="capability" key={capability.title}>
              <span className="cap-number">0{index + 1}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <div>{capability.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="approach section" aria-labelledby="approach-title">
        <div className="approach-intro">
          <p className="eyebrow light"><span /> Engineering approach</p>
          <h2 id="approach-title">Build the right system.<br/><em>Then make it last.</em></h2>
          <p>Good engineering starts before implementation and continues after deployment.</p>
        </div>
        <ol className="principles">
          <li><span>01</span><div><strong>Understand the operation, not only the screen.</strong><p>Model the people, decisions and constraints behind the interface.</p></div></li>
          <li><span>02</span><div><strong>Design explicit systems and state transitions.</strong><p>Make behavior inspectable, predictable and easier to evolve.</p></div></li>
          <li><span>03</span><div><strong>Make correctness visible.</strong><p>Use clear contracts, validation and operational signals.</p></div></li>
          <li><span>04</span><div><strong>Build for production, not just demonstration.</strong><p>Treat deployment, failure and recovery as product concerns.</p></div></li>
          <li><span>05</span><div><strong>Use AI where it improves the workflow.</strong><p>Apply intelligence to useful decisions, with human control where consequences matter.</p></div></li>
        </ol>
      </section>

      <section className="about section" id="about">
        <div><p className="eyebrow"><span /> About</p><p className="about-mark">SJ<span>—</span></p></div>
        <div className="about-copy">
          <h2>Engineering with the whole lifecycle <em>in view.</em></h2>
          <p className="about-lead">Suchay is a full-stack engineer based in Pune who enjoys turning ambiguous operational problems into clear, dependable software.</p>
          <div className="about-columns">
            <p>His work spans enterprise engineering, product architecture, web platforms, production systems and AI-enabled workflows.</p>
            <p>He values end-to-end ownership: thoughtful interfaces, correct backends, deliberate deployment and the operational reliability that earns user trust.</p>
          </div>
        </div>
      </section>

      <section className="contact section" id="contact">
        <p className="eyebrow light"><span /> Start a conversation</p>
        <h2>Building something difficult—or hiring someone who <em>enjoys doing exactly that?</em></h2>
        <a className="contact-email" href="mailto:suchayj@gmail.com">suchayj@gmail.com <Arrow /></a>
        <div className="contact-grid">
          <div><small>Location</small><span>Pune, India</span></div>
          <div><small>Availability</small><span>Within 15 days</span></div>
          <div><small>Phone</small><a href="tel:+918007778797">+91 80077 78797</a></div>
          <div className="contact-social"><small>Elsewhere</small><span><a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub <Arrow /></a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a></span></div>
        </div>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Suchay Janbandhu</span><span>suchay.dev</span>
        <div><a href="https://github.com/suchayj">GitHub</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/">LinkedIn</a></div>
      </footer>
    </main>
  );
}
