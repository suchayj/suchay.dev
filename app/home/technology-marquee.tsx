const technologies = ["Java", "Spring Boot", "Apache Kafka", "React", "Next.js", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "Distributed Systems", "GenAI", "Agentic Systems"] as const;

function MarqueeSet({ hidden = false }: { hidden?: boolean }) {
  return <span className="marquee-set" aria-hidden={hidden || undefined}>{technologies.map((technology) => <span key={technology}>{technology}<i aria-hidden="true">×</i></span>)}</span>;
}

export function TechnologyMarquee() {
  return <section className="technology-marquee" aria-label={`Engineering technologies and domains: ${technologies.join(", ")}`}><div className="marquee-track"><MarqueeSet/><MarqueeSet hidden/></div></section>;
}
