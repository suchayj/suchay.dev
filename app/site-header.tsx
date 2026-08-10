import { ThemeToggle } from "./theme-toggle";
import { SiteNavLink } from "./site-nav-link";

const links = [
  ["Work", "/work"],
  ["Timeline", "/timeline"],
  ["Capabilities", "/capabilities"],
  ["About", "/about"],
] as const;

export function SiteHeader({ current, dark = false }: { current?: string; dark?: boolean }) {
  return (
    <header className={dark ? "about-nav" : "site-header"}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteNavLink className={dark ? "about-wordmark" : "wordmark"} href="/" label="Suchay Janbandhu, home">Suchay<span>.</span></SiteNavLink>
      <nav aria-label="Main navigation">
        {links.map(([label, href]) => <SiteNavLink key={href} href={href} current={current === href}>{label}</SiteNavLink>)}
        <ThemeToggle />
        <SiteNavLink className={`btn btn-secondary btn-compact nav-contact${dark ? " about-nav-contact" : ""}`} href="/contact" current={current === "/contact"}>Contact <span aria-hidden="true">↗</span></SiteNavLink>
      </nav>
    </header>
  );
}
