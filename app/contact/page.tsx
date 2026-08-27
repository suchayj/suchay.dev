import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { HomeFooter } from "../home/home-footer";
import { ContactTrigger } from "../contact-modal";

const title = "Contact Suchay Janbandhu — Senior Full Stack Engineer";
const description = "Start a conversation with Suchay Janbandhu about product engineering, distributed systems and senior full-stack opportunities.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/contact" }, openGraph: { title, description, url: "https://suchay.dev/contact", images: ["/og.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] } };

export default function ContactPage() {
  return <main className="route-page contact-page" id="main-content"><SiteHeader current="/contact" /><section className="contact-route-hero"><p className="eyebrow"><span /> Start a conversation</p><h1>Building something difficult—or hiring someone who <em>enjoys doing exactly that?</em></h1><ContactTrigger className="contact-email">suchayjanbandhu@gmail.com <span aria-hidden="true">↗</span></ContactTrigger><div className="contact-grid"><div><small>Location</small><span>Pune, India</span></div><div><small>Phone</small><a href="tel:+918007778797">+91 80077 78797</a></div><div className="contact-social"><small>Elsewhere</small><span><a href="https://github.com/suchayj" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noreferrer">LinkedIn ↗</a></span></div></div></section><HomeFooter /></main>;
}
