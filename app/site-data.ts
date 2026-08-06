export const projects = [
  {
    name: "Edvora",
    proposition: "School operations, brought into one coherent system.",
    description: "A comprehensive school operating platform spanning academic workflows, students, staff, attendance, timetables, examinations, fees, communication and operational readiness.",
    tags: ["Product Architecture", "Multi-tenant SaaS", "Workflow Systems", "Full Stack"],
  },
  {
    name: "Rentora",
    proposition: "From human language to executable event operations.",
    description: "An AI-first rental and event-operations platform that converts natural-language requirements into structured material, inventory, crew, logistics and readiness plans.",
    tags: ["GenAI", "Planning Engines", "Inventory", "Operational Workflows"],
  },
  {
    name: "Streamora",
    proposition: "Private media infrastructure built for real production use.",
    description: "A secure media platform covering uploads, private storage, processing workers, metadata, playlists, signed access and deployment operations.",
    tags: ["Media Systems", "Background Workers", "Secure Storage", "Next.js"],
  },
  {
    name: "Loom",
    proposition: "A controlled path from source code to production.",
    description: "A deployment and production-operations platform designed around immutable releases, health verification, environment governance and repeatable delivery.",
    tags: ["Deployment Platform", "Release Engineering", "Production Operations", "Infrastructure"],
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
