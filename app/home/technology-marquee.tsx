import {
  Atom,
  Bot,
  Boxes,
  BrainCircuit,
  Braces,
  CloudCog,
  Coffee,
  Container,
  Database,
  GitBranch,
  GitFork,
  GitMerge,
  Leaf,
  Network,
  Triangle,
  type LucideIcon,
} from "lucide-react";

const technologies: ReadonlyArray<{ name: string; icon: LucideIcon }> = [
  { name: "Java", icon: Coffee },
  { name: "Spring Boot", icon: Leaf },
  { name: "Apache Kafka", icon: Network },
  { name: "React", icon: Atom },
  { name: "Next.js", icon: Triangle },
  { name: "TypeScript", icon: Braces },
  { name: "PostgreSQL", icon: Database },
  { name: "Docker", icon: Container },
  { name: "Kubernetes", icon: Boxes },
  { name: "OpenShift", icon: CloudCog },
  { name: "GitHub", icon: GitFork },
  { name: "GitLab", icon: GitMerge },
  { name: "Distributed Systems", icon: GitBranch },
  { name: "GenAI", icon: BrainCircuit },
  { name: "Agentic Systems", icon: Bot },
];

function MarqueeSet({ hidden = false }: { hidden?: boolean }) {
  return <span className="marquee-set" aria-hidden={hidden || undefined}>{technologies.map(({ name, icon: Icon }) => <span className="marquee-item" key={name}><Icon className="technology-icon" aria-hidden="true" strokeWidth={1.5}/><span>{name}</span><i aria-hidden="true">×</i></span>)}</span>;
}

export function TechnologyMarquee() {
  return <section className="technology-marquee" aria-label={`Engineering technologies and domains: ${technologies.map(({ name }) => name).join(", ")}`}><div className="marquee-track"><MarqueeSet/><MarqueeSet hidden/></div></section>;
}
