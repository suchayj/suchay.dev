export const projects = [
  {
    slug: "edvora",
    name: "Edvora",
    proposition: "Educational-institution operations, brought into one coherent system.",
    description: "A full-stack, multi-tenant education platform built with Next.js around academic workflows, identity, administration and production deployment.",
    problem: "School operations fragment across roles, records and time-sensitive workflows.",
    built: "A multi-tenant operating system connecting academic and administrative work.",
    decision: "Model the shared operational domain first, then let each workflow expose only the state its users need.",
    simpleExplanation: "Admissions, academic work and administration need to stay connected. Edvora brings those activities into one platform so an institution can work from a shared system.",
    delivery: "My scope spans the academic and administrative workflows, identity, the product interface and production deployment. The linked Edvora environment is a staging preview.",
    context: "Next.js · Multi-tenant SaaS · Workflow systems",
    tags: ["Full Stack Engineering", "Next.js", "Multi-tenant SaaS", "Educational Technology", "Domain Workflows", "Production Deployment"],
    productUrl: "https://stage.edvoraschool.com",
    productLabel: "Visit Edvora",
  },
  {
    slug: "rentora",
    name: "Rentora",
    proposition: "Intelligent operations for rental and event-production workflows.",
    description: "A full-stack intelligent operations product that translates messy operator language into structured operational state through domain modelling, validation and deterministic reasoning.",
    problem: "Real rental requests arrive as messy language, while operations require exact, reviewable plans.",
    built: "A language-to-operations system for material, inventory, crew, logistics and readiness.",
    decision: "Make structured interpretation and deterministic domain reasoning the foundation, with model usage treated as an architectural choice rather than the product definition.",
    simpleExplanation: "A rental team may receive a rough request for an event. Rentora helps turn that request into a plan for equipment, people and delivery, with the details available for review before anyone acts.",
    delivery: "My scope connects request interpretation with material, inventory, crew, logistics and readiness planning. Validation and review are part of the workflow, alongside the interface and delivery of the product.",
    context: "Intelligent operations · Domain models · Structured validation",
    tags: ["AI Product Engineering", "Intelligent Systems", "Full Stack Engineering", "Structured Interpretation", "Domain Modelling", "Deterministic Reasoning"],
    productUrl: "https://rentora.suchay.dev",
    productLabel: "View product",
  },
  {
    slug: "loom",
    name: "Loom",
    proposition: "Personal infrastructure for controlled software delivery.",
    description: "Personal platform and deployment engineering infrastructure built around immutable releases, runtime health, rollback, environment governance and delivery automation.",
    problem: "A successful build is not enough evidence that a release is safe to activate.",
    built: "An immutable release flow covering activation, runtime health, rollback and retention.",
    decision: "Separate build, readiness and activation so an unhealthy release never silently replaces the known-good runtime.",
    simpleExplanation: "Releasing an update should include checking that it runs correctly. Loom makes that process deliberate, with health checks and a way to return to the previous release.",
    delivery: "My scope covers building releases, checking readiness, activation, runtime health and recovery. Loom is also the delivery infrastructure used for this portfolio.",
    context: "Infrastructure · Deployment pipeline · Release engineering",
    tags: ["Platform Engineering", "Deployment Engineering", "Release Management", "Runtime Health", "Rollback", "Production Operations"],
    productUrl: "https://loom.suchay.dev",
    productLabel: "View Loom",
  },
] as const;

export const capabilities = [
  { title: "Backend, APIs & Event Systems", description: "Java and Spring Boot services, explicit contracts and Kafka-backed integrations built around real operational behavior.", tools: ["Java", "Spring Boot", "Apache Kafka"] },
  { title: "Full Stack Product Engineering", description: "React, Next.js and TypeScript interfaces connected to dependable product services and workflows.", tools: ["React", "Next.js", "TypeScript"] },
  { title: "Distributed System Architecture", description: "Boundaries, state models and event-driven integration patterns designed for change, correctness and ownership.", tools: ["Distributed systems", "Event-driven systems", "API design"] },
  { title: "Data and Persistence", description: "Pragmatic data models, caching and durable workflows with consistency made intentional.", tools: ["PostgreSQL", "Redis", "Data modeling"] },
  { title: "Cloud and Delivery", description: "Repeatable delivery paths with observable services and production operations in view from day one.", tools: ["Docker", "Kubernetes", "OpenShift", "CI/CD"] },
  { title: "AI Product Engineering", description: "GenAI and tool-using workflows that add useful judgment without hiding validation or human control.", tools: ["Generative AI", "Evaluation", "Agentic systems"] },
] as const;

export const capabilityGroups = [
  {
    label: "Build",
    items: [
      { title: "Backend, APIs & Event Systems", description: "Java and Spring Boot services, secure APIs and Kafka-backed integrations.", evidence: ["Java", "Spring Boot", "Apache Kafka"] },
      { title: "Full Stack Product Engineering", description: "React, Next.js and TypeScript interfaces connected to dependable product workflows.", evidence: ["React", "Next.js", "TypeScript"] },
      { title: "Data and Persistence", description: "Durable models, intentional consistency and pragmatic caching.", evidence: ["PostgreSQL", "Redis", "Data modelling"] },
    ],
  },
  {
    label: "Design",
    items: [
      { title: "Distributed System Architecture", description: "Boundaries, state and event-driven integration patterns designed for change.", evidence: ["Distributed systems", "Event-driven systems", "API design"] },
      { title: "Domain Modelling", description: "Ambiguous operations translated into explicit system models and working software.", evidence: ["Domain understanding", "State models", "Implementation"] },
      { title: "AI Product Engineering", description: "GenAI and tool-using workflows with evaluation, validation and human decision boundaries.", evidence: ["Generative AI", "Evaluation", "Agentic systems"] },
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
