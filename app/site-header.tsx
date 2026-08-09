import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  ["Work", "/work"],
  ["Capabilities", "/capabilities"],
  ["About", "/about"],
] as const;

export function SiteHeader({ current, dark = false }: { current?: string; dark?: boolean }) {
  return (
    <header className={dark ? "about-nav" : "site-header"}>
      <Link className={dark ? "about-wordmark" : "wordmark"} href="/" aria-label="Suchay Janbandhu, home">Suchay<span>.</span></Link>
      <nav aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>)}
        <ThemeToggle />
        <Link className={dark ? "about-nav-contact" : "nav-contact"} href="/contact">Contact <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
