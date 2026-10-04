import { formatCareerDateTime, todayDateInput } from "./visitor-presentation";
import type { getSessionIntelligence, SessionFilters } from "../../services/analytics/session-intelligence";

export type VisitorData = Awaited<ReturnType<typeof getSessionIntelligence>>;
export type VisitorSession = VisitorData["sessions"][number];
export type VisitorExportFormat = "csv" | "json";

function csvCell(value: string | number | boolean | null | undefined) {
  let text = value == null ? "" : String(value);
  // Quoting alone does not stop spreadsheet formula execution.
  if (typeof value === "string" && (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function sessionsToCsv(sessions: VisitorSession[]) {
  const columns = ["session_id", "visitor", "owner_device", "traffic", "visitor_type", "start_utc", "start_ist", "last_recorded_utc", "last_recorded_ist", "observed_seconds", "page_views", "device", "browser", "os", "known_crawler", "approximate_location", "landing_path", "last_path", "journey_paths", "journey_times_utc", "events", "event_times_utc", "source", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "viewport_width", "viewport_height", "browser_language", "browser_timezone", "visitor_first_seen_utc", "visitor_last_seen_utc", "visitor_total_sessions", "visitor_total_page_views"];
  const rows = sessions.map(session => [
    session.sessionId, session.visitorLabel, session.ownerDeviceName,
    session.ownerDeviceName ? "Own device" : "External", session.returning ? "Returning" : "New",
    session.startAt.toISOString(), formatCareerDateTime(session.startAt),
    session.endAt.toISOString(), formatCareerDateTime(session.endAt),
    Math.max(0, Math.floor((session.endAt.getTime() - session.startAt.getTime()) / 1000)),
    session.pageCount, session.device.device, session.device.browser, session.device.os, session.device.crawler,
    session.location, session.journey[0]?.path, session.journey.at(-1)?.path,
    session.journey.map(step => step.path).join(" → "), session.journey.map(step => step.visitedAt.toISOString()).join(" | "),
    session.engagement.map(event => event.type).join(" | "), session.engagement.map(event => event.occurredAt.toISOString()).join(" | "),
    session.source.label, session.context?.referrer, session.context?.utmSource, session.context?.utmMedium,
    session.context?.utmCampaign, session.context?.utmContent, session.context?.utmTerm,
    session.context?.viewportWidth, session.context?.viewportHeight, session.context?.browserLanguage, session.context?.browserTimezone,
    session.visitor.firstSeen.toISOString(), session.visitor.lastSeen.toISOString(), session.visitor.sessions, session.visitor.pageViews,
  ]);
  return "\uFEFF" + [columns, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
}

export function createVisitorExport(data: VisitorData, filters: SessionFilters, format: VisitorExportFormat, now = new Date()) {
  const filename = `visitors-${todayDateInput(now)}.${format}`;
  if (format === "csv") return { filename, contentType: "text/csv;charset=utf-8", content: sessionsToCsv(data.sessions) };
  return { filename, contentType: "application/json;charset=utf-8", content: JSON.stringify({
    exportedAt: now.toISOString(), timeZone: "Asia/Kolkata", filterLabel: data.filter.label,
    filters, retentionCutoff: data.retentionCutoff, metrics: data.metrics,
    notes: "Locations are approximate. Duration is observed time between recorded page views, not total time on site. Session and visitor identifiers are anonymous; raw cookies and IP addresses are excluded.",
    sessions: data.sessions,
  }, null, 2) };
}

export function formatSessionDetails(session: VisitorSession) {
  const lines = [
    session.ownerDeviceName ? `${session.visitorLabel} · Your device: ${session.ownerDeviceName}` : session.visitorLabel,
    session.returning ? "Returning visitor" : "New visitor", `Session: ${session.sessionId}`,
    "", "SESSION", `Started: ${formatCareerDateTime(session.startAt)}`,
    `Last page view: ${formatCareerDateTime(session.endAt)}`, `Page views: ${session.pageCount}`,
    `Observed activity: ${session.duration}`, "", "DEVICE & LOCATION",
    `Device: ${session.device.device}`, `Browser: ${session.device.browser}`, `OS: ${session.device.os}`,
    `Location: ${session.location ? `${session.location} (approximate)` : "Unavailable"}`,
    ...(session.device.crawler ? ["Known crawler: Yes"] : []),
    `Viewport: ${session.context?.viewportWidth && session.context.viewportHeight ? `${session.context.viewportWidth} × ${session.context.viewportHeight}` : "Not recorded"}`,
    `Language: ${session.context?.browserLanguage ?? "Not recorded"}`,
    `Browser time zone: ${session.context?.browserTimezone ?? "Not recorded"}`,
    "", "JOURNEY", ...session.journey.map((step, index) =>
      `${index + 1}. ${step.label} (${step.path}) · ${formatCareerDateTime(step.visitedAt)}${step.secondsToNext == null ? "" : ` · ${step.secondsToNext}s until next page`}`),
    "", "ATTRIBUTION", `Source: ${session.source.label}`, `Referrer: ${session.context?.referrer ?? "Not recorded"}`,
  ];
  for (const [label, value] of [["UTM source", session.context?.utmSource], ["Medium", session.context?.utmMedium], ["Campaign", session.context?.utmCampaign], ["Content", session.context?.utmContent], ["Term", session.context?.utmTerm]]) {
    if (value) lines.push(`${label}: ${value}`);
  }
  lines.push("", "ENGAGEMENT", ...(session.engagement.length
    ? session.engagement.map(event => `${event.label} · ${formatCareerDateTime(event.occurredAt)}`)
    : ["No additional actions recorded."]), "", "VISITOR HISTORY",
    `First seen: ${formatCareerDateTime(session.visitor.firstSeen)}`, `Last seen: ${formatCareerDateTime(session.visitor.lastSeen)}`,
    `Recorded sessions: ${session.visitor.sessions}`, `Recorded page views: ${session.visitor.pageViews}`);
  for (const previous of session.visitor.previousSessions) lines.push(`Previous: ${formatCareerDateTime(previous.startAt)} · ${previous.journey.join(" → ")} · ${previous.pageCount} page views`);
  lines.push("", "Locations are approximate. Activity measures only time between recorded page views.");
  return lines.join("\n");
}
