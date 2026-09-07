"use client";

import type { VisitorEventName } from "@/lib/analytics/visitor-events";

export function trackVisitorEvent(type: VisitorEventName) {
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ type, path: window.location.pathname }),
  }).catch(() => undefined);
}
