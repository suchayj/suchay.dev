"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type SiteNavLinkProps = {
  children: ReactNode;
  className?: string;
  current?: boolean;
  href: string;
  label?: string;
};

export function SiteNavLink({ children, className, current = false, href, label }: SiteNavLinkProps) {
  const router = useRouter();

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(href);
  }

  return <a className={className} href={href} aria-current={current ? "page" : undefined} aria-label={label} onClick={navigate}>{children}</a>;
}
