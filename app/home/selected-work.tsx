import Link from "next/link";
import { projects } from "../site-data";

const homepageProjects = ["rentora", "edvora", "streamora", "loom"].map((slug) => projects.find((project) => project.slug === slug)!);

export function SelectedWork() {
  return <section className="work section" id="work">
    <div className="home-section-heading"><p className="eyebrow"><span /> Selected work</p><h2>Products built for <em>real operations.</em></h2></div>
    <div className="work-rows">{homepageProjects.map((project, index) => <article className="work-row" key={project.name}>
      <span className="work-row-index">0{index + 1}</span>
      <h3>{project.name}</h3>
      <p>{project.proposition}</p>
      <span className="work-row-context">{project.context}</span>
      <Link href={`/work/${project.slug}`} aria-label={`Explore ${project.name} case study`}>Explore <span aria-hidden="true">→</span></Link>
    </article>)}</div>
  </section>;
}
