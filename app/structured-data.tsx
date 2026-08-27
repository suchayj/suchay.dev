const personId = "https://suchay.dev/#person";
const websiteId = "https://suchay.dev/#website";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function PortfolioStructuredData() {
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": [
    { "@type": "Person", "@id": personId, name: "Suchay Janbandhu", url: "https://suchay.dev/", jobTitle: "Senior Full Stack Engineer", address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" }, sameAs: ["https://github.com/suchayj", "https://www.linkedin.com/in/suchay-janbandhu-9a014779/"], knowsAbout: ["Full-stack engineering", "Distributed systems", "Product engineering", "Cloud-native systems", "AI-enabled software"] },
    { "@type": "WebSite", "@id": websiteId, url: "https://suchay.dev/", name: "Suchay Janbandhu", inLanguage: "en-IN", publisher: { "@id": personId } },
    { "@type": "ProfilePage", "@id": "https://suchay.dev/#profile", url: "https://suchay.dev/", name: "Suchay Janbandhu — Senior Full Stack Engineer", mainEntity: { "@id": personId }, isPartOf: { "@id": websiteId } },
  ] }} />;
}

export function CaseStudyStructuredData({ project }: { project: { slug: string; name: string; description: string; tags: readonly string[] } }) {
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "CreativeWork", "@id": `https://suchay.dev/work/${project.slug}#case-study`, url: `https://suchay.dev/work/${project.slug}`, name: `${project.name} case study`, description: project.description, author: { "@id": personId, "@type": "Person", name: "Suchay Janbandhu" }, isPartOf: { "@id": websiteId, "@type": "WebSite", name: "Suchay Janbandhu" }, keywords: project.tags.join(", "), inLanguage: "en-IN" }} />;
}
