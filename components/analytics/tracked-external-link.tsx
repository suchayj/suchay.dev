"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { VisitorEventName } from "@/lib/analytics/visitor-events";
import { trackVisitorEvent } from "./track-event";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { event: VisitorEventName; href: string; children: ReactNode };

export function TrackedExternalLink({ event, href, children, onClick, ...props }: Props) {
  return <a {...props} href={href} onClick={(click) => { trackVisitorEvent(event); onClick?.(click); }}>{children}</a>;
}
