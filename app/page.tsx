import type { Metadata } from "next";
import Link from "next/link";
import { capabilities } from "./site-data";
import { SiteHeader } from "./site-header";
import { HomeHero } from "./home/hero";
import { SelectedWork } from "./home/selected-work";
import { TechnologyMarquee } from "./home/technology-marquee";
import { HomeFooter } from "./home/home-footer";
import { ContactTrigger } from "./contact-modal";
import "./home/home.css";
import { PortfolioStructuredData } from "./structured-data";

export const metadata: Metadata = {
  title: "Suchay Janbandhu — Senior Full Stack Engineer",
  description:
    "Senior Full Stack Engineer based in Pune, building enterprise platforms, modern web products, cloud-native systems and AI-enabled software.",
  alternates: { canonical: "/" },
  openGraph: { title: "Suchay Janbandhu — Senior Full Stack Engineer", description: "Senior Full Stack Engineer building dependable products, distributed systems and AI-enabled software.", url: "https://suchay.dev/", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Suchay Janbandhu — Senior Full Stack Engineer" }] },
  twitter: { card: "summary_large_image", title: "Suchay Janbandhu — Senior Full Stack Engineer", description: "Senior Full Stack Engineer building dependable products, distributed systems and AI-enabled software.", images: ["/og.png"] },
};

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main className="home-page public-page" id="main-content">
      <SiteHeader />
      <PortfolioStructuredData />

      <HomeHero />
      <SelectedWork />

      <section className="capabilities section" id="capabilities">
        <div className="home-section-heading compact">
          <p className="eyebrow"><span /> Capabilities</p>
          <h2>Depth where it <em>matters.</em></h2>
        </div>
        <div className="capability-lines">
          {[capabilities[0], capabilities[2], capabilities[5]].map((capability) => (
            <article key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.tools.join(" · ")}</p>
            </article>
          ))}
        </div>
        <Link className="home-text-link" href="/capabilities">Explore capabilities <span aria-hidden="true">→</span></Link>
      </section>

      <section className="about section" id="about">
        <p className="eyebrow"><span /> About</p>
        <h2>Engineering with the whole lifecycle <em>in view.</em></h2>
        <p>Suchay is a full-stack engineer in Pune, turning ambiguous operational problems into clear, dependable software.</p>
        <Link className="home-text-link" href="/about">Read the story <span aria-hidden="true">→</span></Link>
      </section>

      <TechnologyMarquee />

      <section className="contact section" id="contact">
        <p className="eyebrow light"><span /> Start a conversation</p>
        <h2>Building something difficult?</h2>
        <ContactTrigger className="contact-email">suchayj@gmail.com <Arrow /></ContactTrigger>
      </section>

      <HomeFooter />
    </main>
  );
}
