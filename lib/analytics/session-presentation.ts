import { createHash } from "node:crypto";

export type DeviceKind = "Desktop" | "Mobile" | "Tablet" | "Unknown";
export type SourceKind = "Direct" | "Google" | "LinkedIn" | "UTM/campaign" | "Other referral";

export function anonymousVisitorLabel(visitorKey: string) {
  return `Anonymous #${createHash("sha256").update(visitorKey).digest("hex").slice(0, 4).toUpperCase()}`;
}

export function anonymousSessionId(sessionKey: string) {
  return createHash("sha256").update(`session:${sessionKey}`).digest("hex").slice(0, 16);
}

export function readablePath(path: string) {
  const names: Record<string, string> = {
    "/": "Home", "/timeline": "Work Timeline", "/capabilities": "Capabilities", "/about": "About",
    "/resume": "Résumé", "/contact": "Contact", "/work/rentora": "Rentora", "/work/edvora": "Edvora", "/work/loom": "Loom",
  };
  return names[path] ?? path;
}

export function observedDuration(start: Date, end: Date, pages: number) {
  if (pages <= 1) return "Single recorded page view";
  const seconds = Math.floor((end.getTime() - start.getTime()) / 1_000);
  if (seconds <= 0) return "Multiple page views at the same recorded time";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes ? `${minutes}m ` : ""}${remainder}s observed activity`;
}

export function parseUserAgent(userAgent: string | null): { device: DeviceKind; browser: string; os: string; crawler: boolean } {
  if (!userAgent) return { device: "Unknown", browser: "Unknown browser", os: "Unknown OS", crawler: false };
  const crawler = /bot|crawler|spider|slurp|bingpreview/i.test(userAgent);
  const device: DeviceKind = /ipad|tablet/i.test(userAgent) ? "Tablet" : /mobile|iphone|android/i.test(userAgent) ? "Mobile" : "Desktop";
  const browser = /edg\//i.test(userAgent) ? "Edge" : /opr\//i.test(userAgent) ? "Opera" : /chrome|crios/i.test(userAgent) ? "Chrome" : /firefox|fxios/i.test(userAgent) ? "Firefox" : /safari/i.test(userAgent) ? "Safari" : "Unknown browser";
  const os = /iphone|ipad|cpu (?:iphone )?os/i.test(userAgent) ? "iOS" : /android/i.test(userAgent) ? "Android" : /macintosh|mac os x/i.test(userAgent) ? "macOS" : /windows/i.test(userAgent) ? "Windows" : /linux/i.test(userAgent) ? "Linux" : "Unknown OS";
  return { device, browser, os, crawler };
}

export function classifySource(input: { utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; referrer: string | null }) {
  const source = input.utmSource?.trim().toLowerCase();
  if (source) {
    const name = source === "linkedin" ? "LinkedIn" : source === "whatsapp" ? "WhatsApp" : source === "google" ? "Google" : source;
    return { kind: "UTM/campaign" as SourceKind, label: name, detail: [input.utmMedium, input.utmCampaign].filter(Boolean).join(" · ") || "UTM attribution" };
  }
  if (!input.referrer) return { kind: "Direct" as SourceKind, label: "Direct / referrer unavailable", detail: null };
  try {
    const domain = new URL(input.referrer).hostname.replace(/^www\./, "");
    if (domain.includes("google.")) return { kind: "Google" as SourceKind, label: "Google", detail: "organic/referral" };
    if (domain.includes("linkedin.")) return { kind: "LinkedIn" as SourceKind, label: "LinkedIn", detail: "referral" };
    return { kind: "Other referral" as SourceKind, label: domain, detail: "referral" };
  } catch {
    return { kind: "Other referral" as SourceKind, label: "Referral", detail: null };
  }
}
