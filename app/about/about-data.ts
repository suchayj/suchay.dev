export const journey = [
  {
    index: "01",
    period: "Foundations",
    title: "Enterprise foundations",
    body: "Suchay developed his engineering foundations around enterprise systems, complex workflows, large codebases and production constraints.",
    detail: "That environment sharpened an appreciation for durable boundaries, explicit behaviour and software that remains understandable as it grows.",
    image: "/images/about/gym-potrait.jpg",
    alt: "An authentic close portrait of Suchay in a dark T-shirt",
    position: "50% 24%",
  },
  {
    index: "02",
    period: "Ownership",
    title: "Building complete products",
    body: "The focus expanded from implementing features to owning product architecture, frontend experience, backend correctness, data models and deployment.",
    detail: "The work became less about an isolated layer and more about the decisions that connect a useful product to reliable operation.",
    image: "/images/about/black-thsirt-walking.jpg",
    alt: "Suchay walking outdoors against an open hillside",
    position: "50% 34%",
  },
  {
    index: "03",
    period: "Now",
    title: "Product systems and AI",
    body: "Current work centres on complete platforms such as Edvora, Rentora and Loom, with increasing focus on intelligent workflows, operational systems and production-grade delivery.",
    detail: "The aim is practical intelligence: systems that understand context, improve decisions and preserve human control when actions matter.",
  },
] as const;

export const systems = [
  { index: "01", name: "Edvora", proposition: "One operating model for educational institutions.", description: "An education platform spanning academic workflows, students, staff, attendance, timetables, examinations, fees, communication and operational readiness.", tags: ["Domain modelling", "Multi-tenant SaaS", "Workflows"] },
  { index: "02", name: "Rentora", proposition: "Operator language becomes structured operational state.", description: "An intelligent rental and event-production system built through structured interpretation, domain modelling, validation and deterministic reasoning.", tags: ["Intelligent operations", "Planning engines", "Domain modelling"] },
  { index: "03", name: "Loom", proposition: "A deliberate route from source to production.", description: "Personal deployment infrastructure centred on immutable releases, environment governance, health verification and delivery automation.", tags: ["Deployment engineering", "Operational tooling", "Infrastructure"] },
] as const;

export const capabilityNarratives = [
  { index: "01", title: "Product and domain modelling", body: "Turning operational language into clear concepts, boundaries, workflows and state transitions before choosing the interface or implementation." },
  { index: "02", title: "Backend systems and APIs", body: "Building dependable services and integrations with Java, Spring Boot, REST APIs and PostgreSQL, with correctness made explicit." },
  { index: "03", title: "Modern frontend engineering", body: "Creating thoughtful product interfaces with React, Next.js and TypeScript so complex work remains legible and responsive." },
  { index: "04", title: "Cloud, delivery and operations", body: "Treating Docker, Kubernetes, OpenShift and CI/CD as part of the product lifecycle—not an activity deferred until the end." },
  { index: "05", title: "AI-enabled product workflows", body: "Using LLM integrations and tool-enabled AI workflows where they add useful context, planning or judgment while preserving accountable human control." },
] as const;
