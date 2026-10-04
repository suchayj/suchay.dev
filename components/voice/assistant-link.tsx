"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AssistantLink({ children, className }: { children: ReactNode; className?: string }) {
  return <Link href="/contact" className={className} onClick={event => {
    if (window.location.pathname !== "/contact" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById("voice");
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    const heading = document.getElementById("voice-heading");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }}>{children}</Link>;
}
