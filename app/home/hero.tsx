import Image from "next/image";
import Link from "next/link";
import { ContactTrigger } from "../contact-modal";

const Arrow = () => <span aria-hidden="true">↗</span>;

export function HomeHero() {
  return <section className="hero section" id="top" aria-labelledby="home-hero-title">
    <div className="hero-copy">
      <p className="eyebrow"><span /> Suchay Janbandhu · Pune</p>
      <h1 id="home-hero-title">I build software that moves from complex ideas to <em>reliable production systems.</em></h1>
      <p className="hero-intro">Full Stack Engineer building AI and GenAI products, distributed systems and reliable software from product idea to production.</p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/timeline">View selected work <span aria-hidden="true">→</span></Link>
        <ContactTrigger className="btn btn-secondary">Contact me <Arrow /></ContactTrigger>
      </div>
      <div className="hero-meta" aria-label="Profile links and availability">
        <a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub <Arrow /></a>
        <a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
        <Link href="/resume">Résumé <Arrow /></Link>
      </div>
    </div>
    <div className="hero-visual portrait-stage">
      <span className="portrait-stage-label" aria-hidden="true">Engineer / Product builder</span>
      <figure className="portrait-visual">
        <Image className="portrait-source" src="/images/about/suchay-color-cutout-original.png" alt="Portrait of Suchay Janbandhu wearing a black T-shirt" fill priority sizes="(max-width: 680px) 78vw, 340px" />
      </figure>
    </div>
  </section>;
}
