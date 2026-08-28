export const projects = [
  {
    slug: "edvora",
    name: "Edvora",
    proposition: "Educational-institution operations, brought into one coherent system.",
    description: "A platform for educational institutions spanning academic workflows, students, staff, attendance, timetables, examinations, fees, communication and operational readiness.",
    problem: "School operations fragment across roles, records and time-sensitive workflows.",
    built: "A multi-tenant operating system connecting academic and administrative work.",
    decision: "Model the shared operational domain first, then let each workflow expose only the state its users need.",
    context: "Next.js · Multi-tenant SaaS · Workflow systems",
    tags: ["Product Architecture", "Multi-tenant SaaS", "Workflow Systems", "Full Stack"],
    productUrl: "https://stage.edvoraschool.com",
    productLabel: "Visit Edvora",
  },
  {
    slug: "rentora",
    name: "Rentora",
    proposition: "Intelligent operations for rental and event-production workflows.",
    description: "An intelligent operations system that translates messy operator language into structured operational state through domain modelling, validation and deterministic reasoning.",
    problem: "Real rental requests arrive as messy language, while operations require exact, reviewable plans.",
    built: "A language-to-operations system for material, inventory, crew, logistics and readiness.",
    decision: "Make structured interpretation and deterministic domain reasoning the foundation, with model usage treated as an architectural choice rather than the product definition.",
    context: "Intelligent operations · Domain models · Structured validation",
    tags: ["Intelligent Operations", "Domain Modelling", "Planning Engines", "Operational Workflows"],
    productUrl: "https://rentora.suchay.dev",
    productLabel: "View product",
  },
  {
    slug: "loom",
    name: "Loom",
    proposition: "Personal infrastructure for controlled software delivery.",
    description: "Deployment engineering and operational tooling built around immutable releases, health verification, environment governance and repeatable delivery.",
    problem: "A successful build is not enough evidence that a release is safe to activate.",
    built: "An immutable release flow covering activation, runtime health, rollback and retention.",
    decision: "Separate build, readiness and activation so an unhealthy release never silently replaces the known-good runtime.",
    context: "Infrastructure · Deployment pipeline · Release engineering",
    tags: ["Infrastructure", "Deployment Engineering", "Release Engineering", "Operational Tooling"],
    productUrl: "https://loom.suchay.dev",
    productLabel: "View Loom",
  },
] as const;

export const capabilities = [
  { title: "Backend and APIs", description: "Domain-driven services, explicit contracts and secure integrations built around real operational behavior.", tools: ["Java", "Spring Boot", "REST APIs"] },
  { title: "Frontend and Product UI", description: "Responsive product interfaces that make complex workflows feel clear, fast and trustworthy.", tools: ["React", "Next.js", "TypeScript"] },
  { title: "System Architecture", description: "Boundaries, state models and integration patterns designed for change, correctness and ownership.", tools: ["Domain modeling", "Distributed systems", "API design"] },
  { title: "Data and Persistence", description: "Pragmatic data models, caching and durable workflows with consistency made intentional.", tools: ["PostgreSQL", "Redis", "Data modeling"] },
  { title: "Cloud and Delivery", description: "Repeatable delivery paths with observable services and production operations in view from day one.", tools: ["Docker", "Kubernetes", "OpenShift", "CI/CD"] },
  { title: "AI Product Engineering", description: "LLM-enabled workflows and tool-using systems that add useful judgment without hiding control.", tools: ["LLM integrations", "AI workflows", "Tool-enabled agents"] },
] as const;

export const capabilityGroups = [
  {
    label: "Build",
    items: [
      { title: "Backend and APIs", description: "Domain-led services, explicit contracts and secure integrations.", evidence: ["Java", "Spring Boot", "REST APIs"] },
      { title: "Frontend and Product UI", description: "Clear interfaces for complex operational workflows.", evidence: ["React", "Next.js", "TypeScript"] },
      { title: "Data and Persistence", description: "Durable models, intentional consistency and pragmatic caching.", evidence: ["PostgreSQL", "Redis", "Data modelling"] },
    ],
  },
  {
    label: "Design",
    items: [
      { title: "System Architecture", description: "Boundaries, state and integration patterns designed for change.", evidence: ["Distributed systems", "API design", "Workflow modelling"] },
      { title: "Domain Modelling", description: "Ambiguous operations translated into explicit system models and working software.", evidence: ["Domain understanding", "State models", "Implementation"] },
      { title: "AI Product Engineering", description: "Useful AI workflows with validation, control and human decision boundaries.", evidence: ["LLM integrations", "Evaluation", "Agentic systems"] },
    ],
  },
  {
    label: "Operate",
    items: [
      { title: "Cloud and Delivery", description: "Repeatable releases, observable services and production recovery paths.", evidence: ["Docker", "Kubernetes", "OpenShift", "CI/CD"] },
      { title: "Controlled Environments", description: "Engineering within security, governance, auditability and correctness constraints.", evidence: ["Secure integrations", "Traceable behaviour", "Enterprise systems"] },
    ],
  },
  {
    label: "Own",
    items: [
      { title: "Operational Problem Solving", description: "Manual, repetitive work reshaped into dependable software and automation.", evidence: ["Problem framing", "Automation", "Validation"] },
      { title: "Independent Project Ownership", description: "Hands-on ownership from problem and design through delivery and iteration.", evidence: ["Design", "Implementation", "Delivery"] },
    ],
  },
] as const;
