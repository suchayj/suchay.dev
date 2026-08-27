import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogIn } from "lucide-react";

const links = [
  ["Work Timeline", "/timeline"],
  ["Capabilities", "/capabilities"],
  ["About", "/about"],
  ["Résumé", "/resume"],
] as const;

export function SiteHeader({ current, dark = false }: { current?: string; dark?: boolean }) {
  return (
    <header className={dark ? "about-nav" : "site-header"}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Link className={dark ? "about-wordmark" : "wordmark"} href="/" aria-label="Suchay Janbandhu, home">Suchay<span>.</span></Link>
      <nav aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>)}
        <Link className="nav-login" href="/login" aria-label="CareerOS login" title="CareerOS login"><LogIn aria-hidden="true" strokeWidth={1.7} /></Link>
        <ThemeToggle />
        <Link className={`btn btn-secondary btn-compact nav-contact${dark ? " about-nav-contact" : ""}`} href="/contact" aria-current={current === "/contact" ? "page" : undefined}>Contact <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
