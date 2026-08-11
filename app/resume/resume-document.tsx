import { contact, resumeFacts as facts } from "./resume-data";

function RoleHeader({ company, title, period, location }: { company: string; title: string; period: string; location?: string }) {
  return <header className="resume-role-header"><div><h3>{company}</h3><p>{title}{location ? ` · ${location}` : ""}</p></div><time>{period}</time></header>;
}

function Project({ name, children }: { name: string; children: React.ReactNode }) {
  return <section className="resume-project"><h4>{name}</h4>{children}</section>;
}

export function ResumeDocument() {
  return <article className="resume-document" aria-label="Résumé of Suchay Janbandhu">
    <section className="resume-sheet" data-resume-page="1">
      <header className="resume-identity">
        <div><p className="resume-kicker">Senior Full Stack Engineer</p><h1>Suchay Janbandhu</h1><p className="resume-positioning">Enterprise Systems · Product Engineering · Platform &amp; Production · GenAI</p></div>
        <address>
          <span>{contact.location}</span><a href={`mailto:${contact.email}`}>{contact.email}</a><a href={`tel:${contact.phoneHref}`}>{contact.phoneLabel}</a>
          <a href="https://suchay.dev">{contact.website}</a><a href="https://github.com/suchayj">{contact.github}</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/">LinkedIn</a>
        </address>
      </header>

      <section className="resume-section resume-summary"><h2>Profile</h2><p>Senior Full Stack Engineer with 10+ years of non-overlapping professional experience across enterprise banking systems, product engineering and production delivery. Builds Java and Spring services, modern web applications, event-driven integrations and operational software with explicit boundaries and dependable failure paths. Since March 2026, independently engineering GenAI products where deterministic control, validation and human decision boundaries matter.</p><p className="resume-availability">{contact.availability}</p></section>

      <section className="resume-section"><h2>Experience</h2>
        <article className="resume-role">
          <RoleHeader company="Independent Product Engineering & GenAI" title="Senior Full Stack / Product Engineer" period={facts.independent.period} />
          <Project name={facts.rentora.name}>
            <ul><li>Engineering an AI-first operations system that converts natural-language requirements into structured material, inventory, sourcing, crew, logistics and readiness plans.</li><li>Designed a deterministic language engine with LLM fallback, preservation-first interpretation, semantic and verified validation, and explicit human decision boundaries.</li><li>Established evaluation, regression, SIT and model-comparison practices to keep interpretation behaviour inspectable as models and prompts evolve.</li></ul>
          </Project>
          <div className="resume-project-grid">
            <Project name={facts.edvora.name}><p>Multi-tenant school OS spanning admissions, academics, identity, operational workflows and deployment.</p></Project>
            <Project name={facts.loom.name}><p>Immutable deployment platform covering release activation, runtime health, rollback, readiness configuration and retention.</p></Project>
            <Project name={facts.streamora.name}><p>Private media platform for uploads, storage, processing workers, metadata and signed access.</p></Project>
          </div>
        </article>

        <article className="resume-role resume-role-barclays">
          <RoleHeader company={facts.barclays.name} title="Software Engineering — Barclays" period={facts.barclays.period} />
          <Project name={facts.vocalink.name}><ul><li>Worked with Kafka-based event processing and resilient Vocalink feedback delivery using Java, Spring Boot, bounded API retries, exponential backoff and a dedicated retry/recovery topic.</li><li>Worked on failure isolation and recovery workflows; scope was the integration, not ownership of the wider Mastercard platform.</li></ul></Project>
          <Project name={facts.bidv.name}><ul><li>Built backend and full-stack integrations for identity, authentication and verification across multi-channel login journeys.</li><li>Worked across enterprise APIs and secure banking-system boundaries, keeping trust, responses and failure handling explicit.</li></ul></Project>
          <Project name={facts.amazonConnect.name}><p>Contributed to voice recognition and suspicious-interaction workflows in an Amazon Connect-related system; exact AWS service terminology remains pending verification.</p></Project>
        </article>
      </section>
    </section>

    <section className="resume-sheet" data-resume-page="2">
      <section className="resume-section resume-page-two"><h2>Earlier Experience</h2>
        <article className="resume-role">
          <RoleHeader company={facts.sysnik.name} title={facts.sysnik.role} period={facts.sysnik.period} location={facts.sysnik.location} />
          <ul><li>Delivered full-stack master-data management for banking operations using Angular, Spring Boot and Microsoft SQL Server.</li><li>Developed strategic microservices within the Syscore Core Banking System and contributed banking-domain engineering across service boundaries.</li><li>Built reporting workflows with BIRT, Spring Boot and Angular across backend services and product UI.</li><li>Created a drag-and-drop UI builder through proof-of-concept delivery and technology evaluation across Angular, Vue and JavaScript.</li></ul>
        </article>
        <article className="resume-role resume-compact-role">
          <RoleHeader company={facts.rebelute.name} title={facts.rebelute.role} period={facts.rebelute.period} location={facts.rebelute.location} />
          <p>Selected technology and architecture for Tweebr across Spring Boot, Laravel, Vue, AWS EC2 and SQS, plus messaging integrations.</p>
        </article>
        <article className="resume-role resume-compact-role">
          <RoleHeader company={facts.cygnet.name} title={facts.cygnet.role} period={facts.cygnet.period} location={facts.cygnet.location} />
          <p>Developed FastraxPOS Digital Signage, including a control-center application and ConnectWise ticket/detail API integration for an offshore client product.</p>
        </article>
      </section>

      <section className="resume-section resume-skills"><h2>Engineering Capabilities</h2>
        <dl>
          <div><dt>Backend &amp; APIs</dt><dd>Java, Spring Boot, REST APIs, enterprise integrations, microservices</dd></div>
          <div><dt>Frontend &amp; Product</dt><dd>React, Next.js, TypeScript, Angular, Vue, JavaScript</dd></div>
          <div><dt>Events &amp; Data</dt><dd>Apache Kafka, Resilience4j, retry strategies, recovery topics, PostgreSQL, Redis, SQL Server, data modelling</dd></div>
          <div><dt>Cloud &amp; Production</dt><dd>AWS EC2, AWS SQS, Docker, Kubernetes, OpenShift, CI/CD, Node.js, PM2, Nginx</dd></div>
          <div><dt>AI Product Engineering</dt><dd>LLM integrations, deterministic language systems, structured validation, evaluation and regression, human decision boundaries</dd></div>
          <div><dt>System Design</dt><dd>Domain modelling, distributed systems, API design, workflow and state modelling, production operations</dd></div>
        </dl>
      </section>

      <section className="resume-section resume-education"><h2>Education</h2><div><h3>{facts.education.qualification} · {facts.education.discipline}</h3><p>{facts.education.institution} · {facts.education.location}</p><time>{facts.education.period}</time></div></section>
      <footer className="resume-footer"><span>suchay.dev</span><span>Senior Full Stack Engineer · Pune</span></footer>
    </section>
  </article>;
}
