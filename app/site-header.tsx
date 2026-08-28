"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogIn, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Work Timeline", "/timeline"],
  ["Capabilities", "/capabilities"],
  ["About", "/about"],
  ["Résumé", "/resume"],
] as const;

export function SiteHeader({ current, dark = false }: { current?: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  function closeNavigation(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNavigation();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className={dark ? "about-nav" : "site-header"}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Link className={dark ? "about-wordmark" : "wordmark"} href="/" aria-label="Suchay Janbandhu, home">Suchay<span>.</span></Link>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>)}
        <Link className="nav-login" href="/login" aria-label="CareerOS login" title="CareerOS login"><LogIn aria-hidden="true" strokeWidth={1.7} /></Link>
        <ThemeToggle />
        <Link className={`btn btn-secondary btn-compact nav-contact${dark ? " about-nav-contact" : ""}`} href="/contact" aria-current={current === "/contact" ? "page" : undefined}>Contact <span aria-hidden="true">↗</span></Link>
      </nav>
      <div className="mobile-navigation-controls">
        <ThemeToggle />
        <button
          ref={triggerRef}
          className="mobile-menu-trigger"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => open ? closeNavigation(false) : setOpen(true)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div className="mobile-navigation-backdrop">
          <button className="mobile-navigation-dismiss" type="button" aria-label="Close navigation" tabIndex={-1} onClick={() => closeNavigation()} />
          <div ref={drawerRef} className="mobile-navigation-drawer" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <nav aria-label="Mobile navigation links">
              {links.map(([label, href]) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined} onClick={() => closeNavigation(false)}>{label}</Link>)}
              <Link href="/contact" aria-current={current === "/contact" ? "page" : undefined} onClick={() => closeNavigation(false)}>Contact</Link>
            </nav>
            <div className="mobile-navigation-secondary">
              <Link className="mobile-login" href="/login" onClick={() => closeNavigation(false)}><LogIn aria-hidden="true" strokeWidth={1.7} /> <span>CareerOS Login</span></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
