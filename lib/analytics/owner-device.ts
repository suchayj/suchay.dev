import { parseUserAgent } from "./session-presentation";

export const OWNER_VISITOR_COOKIE = "suchay_visitor";
export function validVisitorKey(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
export function defaultDeviceName(userAgent: string | null) {
  const agent = parseUserAgent(userAgent);
  const hardware = /iphone/i.test(userAgent ?? "") ? "iPhone" : /ipad/i.test(userAgent ?? "") ? "iPad" : agent.os === "macOS" ? "Mac" : agent.os;
  return `${hardware} · ${agent.browser}`;
}
