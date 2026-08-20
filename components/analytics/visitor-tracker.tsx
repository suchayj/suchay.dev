"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isTrackablePublicPath } from "@/lib/analytics/public-paths";

export function VisitorTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!isTrackablePublicPath(pathname) || lastPath.current === pathname) return;
    lastPath.current = pathname;
    const params = new URLSearchParams(window.location.search);
    void fetch("/api/analytics/visit", {
      method: "POST", headers: { "content-type": "application/json" }, keepalive: true,
      body: JSON.stringify({
        path: pathname, referrer: document.referrer || null,
        utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      }),
    });
  }, [pathname]);
  return null;
}
