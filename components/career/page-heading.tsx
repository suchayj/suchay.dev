export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="career-page-heading"><p className="eyebrow"><span />{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}
