import type { Metadata } from "next";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = { title: "Contact — Suchay Janbandhu", description: "Start a conversation with Suchay Janbandhu about product engineering and senior full-stack opportunities.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <main className="route-page contact-page"><SiteHeader current="/contact" /><section className="contact-route-hero"><p className="eyebrow"><span /> Start a conversation</p><h1>Building something difficult—or hiring someone who <em>enjoys doing exactly that?</em></h1><a className="contact-email" href="mailto:suchayj@gmail.com">suchayj@gmail.com <span aria-hidden="true">↗</span></a><div className="contact-grid"><div><small>Location</small><span>Pune, India</span></div><div><small>Availability</small><span>Within 15 days</span></div><div><small>Phone</small><a href="tel:+918007778797">+91 80077 78797</a></div><div className="contact-social"><small>Elsewhere</small><span><a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn ↗</a></span></div></div></section></main>;
}
