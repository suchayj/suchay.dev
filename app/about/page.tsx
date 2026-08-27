import type { Metadata } from "next";
import Link from "next/link";
import { PhotoFrame } from "./photo-frame";
import { SiteHeader } from "../site-header";
import { HomeFooter } from "../home/home-footer";
import { ContactTrigger } from "../contact-modal";
import "./about.css";

export const metadata: Metadata = {
  title: "About Suchay Janbandhu — Engineer, Product Builder",
  description: "How Suchay Janbandhu approaches product engineering, enterprise systems, cloud delivery and AI-enabled workflows.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Suchay Janbandhu", description: "A visual engineering biography: from enterprise foundations to complete products and AI-enabled systems.", url: "https://suchay.dev/about", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "About Suchay Janbandhu", description: "A visual engineering biography of Suchay Janbandhu.", images: ["/og.png"] },
};

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function AboutPage() {
  return (
    <main className="about-page" id="main-content">
      <SiteHeader current="/about" dark />

      <section className="about-hero about-shell">
        <div className="about-hero-copy">
          <p className="about-kicker"><span /> About Suchay</p>
          <h1>I enjoy turning ambiguous, operational problems into software that people can <em>actually depend on.</em></h1>
          <p className="about-intro">I’m a full-stack engineer based in Pune, working across enterprise platforms, product architecture, modern web applications, cloud-native delivery and AI-enabled workflows.</p>
        </div>
      </section>

      <section className="statement about-shell">
        <blockquote>“I care about what happens <em>after the interface:</em> state, correctness, deployment, recovery and whether the workflow genuinely works.”</blockquote>
        <div className="statement-body">
          <p className="about-kicker"><span /> A working philosophy</p>
          <p>Start with the real operation: the people involved, the decisions they make and the conditions under which the system can fail. From there, create explicit domain and state models that make behaviour easier to reason about.</p>
          <p>Build end to end instead of treating frontend, backend and delivery as disconnected concerns. Deployment and production behaviour belong to the product. AI belongs where it improves a human workflow—and consequential actions should keep a human in control.</p>
        </div>
      </section>

      <section className="beyond about-shell">
        <PhotoFrame src="/images/about/beach-goggle.jpg" alt="Suchay smiling beside the water in sunglasses" label="Beyond the code" sizes="(max-width: 760px) 100vw, 48vw" objectPosition="50% 28%" />
        <div><p className="about-kicker"><span /> Beyond the code</p><h2>Perspective comes from <em>looking beyond the screen.</em></h2><p>Good engineering is only one part of a good life. Outside software, I value fitness, wildlife, travel, music and the perspective that comes from exploring interests beyond a screen.</p><ul><li>Product thinking</li><li>Continuous learning</li><li>Fitness & discipline</li><li>Wildlife & exploration</li><li>Music & creative interests</li></ul></div>
      </section>

      <section className="about-closing about-shell" id="about-contact">
        <p className="about-kicker"><span /> Start a conversation</p>
        <h2>I’m interested in difficult systems, meaningful products and teams that care about how software <em>behaves in the real world.</em></h2>
        <div className="closing-actions"><ContactTrigger className="closing-email">suchayjanbandhu@gmail.com <Arrow /></ContactTrigger><Link className="btn btn-primary" href="/timeline">View selected work <span aria-hidden="true">→</span></Link></div>
        <div className="closing-meta"><div><small>Location</small><span>Pune, India</span></div><div><small>Phone</small><a href="tel:+918007778797">+91 80077 78797</a></div><div><small>Elsewhere</small><span><a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub <Arrow /></a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a></span></div></div>
      </section>
      <HomeFooter />
    </main>
  );
}
