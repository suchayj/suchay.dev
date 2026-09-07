"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { loadVisitorIntelligence } from "@/actions/visitor-actions";
import { formatCareerDateTime, todayDateInput } from "@/lib/analytics/visitor-presentation";
import type { getSessionIntelligence, SessionFilters } from "@/services/analytics/session-intelligence";

type Data = Awaited<ReturnType<typeof getSessionIntelligence>>;
type Session = Data["sessions"][number];

const presets = [["all", "All retained"], ["today", "Today"], ["yesterday", "Yesterday"], ["day-before-yesterday", "Day before yesterday"], ["last-3", "Last 3 days"], ["last-4", "Last 4 days"], ["last-10", "Last 10 days"]] as const;

export function VisitorIntelligence({ initialData }: { initialData: Data }) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<SessionFilters>({ preset: "all", visitor: "all", device: "all", source: "all" });
  const [selected, setSelected] = useState<Session | null>(null);
  const [pending, startTransition] = useTransition();

  const load = (nextFilters: SessionFilters, page = 1) => {
    setFilters(nextFilters);
    startTransition(async () => setData(await loadVisitorIntelligence({ page, filters: nextFilters })));
  };

  return <section className="visitor-section" aria-labelledby="visitor-title">
    <div className="section-title"><p className="eyebrow"><span />Visitor intelligence</p><h2 id="visitor-title">Anonymous sessions, made useful.</h2></div>
    <div className="visitor-filter-bar">
      <div className="visitor-presets">{presets.map(([value, label]) => <button key={value} type="button" aria-pressed={(filters.preset ?? "all") === value} onClick={() => load({ ...filters, preset: value, start: undefined, end: undefined })}>{label}</button>)}</div>
      <form className="visitor-date-range" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); load({ ...filters, preset: "custom", start: String(form.get("start")), end: String(form.get("end") || form.get("start")) }); }}><label>From<input name="start" type="date" max={todayDateInput()} required /></label><label>To<input name="end" type="date" max={todayDateInput()} /></label><button type="submit">Apply dates</button></form>
      <div className="visitor-select-filters"><label>Visitor<select value={filters.visitor} onChange={(e) => load({ ...filters, visitor: e.target.value as SessionFilters["visitor"] })}><option value="all">All</option><option value="new">New</option><option value="returning">Returning</option></select></label><label>Device<select value={filters.device} onChange={(e) => load({ ...filters, device: e.target.value as SessionFilters["device"] })}><option value="all">All</option><option>Desktop</option><option>Mobile</option><option>Tablet</option><option>Unknown</option></select></label><label>Source<select value={filters.source} onChange={(e) => load({ ...filters, source: e.target.value as SessionFilters["source"] })}><option value="all">All</option><option>Direct</option><option>Google</option><option>LinkedIn</option><option>UTM/campaign</option><option>Other referral</option></select></label></div>
      <p className="visitor-filter-summary"><strong>{data.filter.label}</strong><span>All timestamps and calendar boundaries use IST.</span></p>
    </div>
    <dl className="visitor-metrics intelligence-metrics"><Metric label="Anonymous visitors" value={data.metrics.anonymousVisitors} /><Metric label="Sessions" value={data.metrics.sessions} /><Metric label="Page views" value={data.metrics.pageViews} /><Metric label="New visitors" value={data.metrics.newVisitors} /><Metric label="Returning visitors" value={data.metrics.returningVisitors} /><Metric label="Résumé views" value={data.metrics.resumeViews} /><Metric label="Contact opens" value={data.metrics.contactOpens} /><Metric label="Product opens" value={data.metrics.productOpens} /></dl>
    <p className="visitor-definition">Anonymous labels identify a first-party browser cookie, not a verified person. Sessions use the existing 30-minute session cookie; observed activity is only the interval between recorded actions.</p>
    <div className={`session-list${pending ? " is-loading" : ""}`} aria-busy={pending}>{pending && <p className="analytics-loading" role="status">Loading sessions…</p>}{!pending && !data.sessions.length && <div className="analytics-empty visitor-empty"><p>No sessions match these filters.</p><button type="button" onClick={() => load({ preset: "all", visitor: "all", device: "all", source: "all" })}>Clear filters</button></div>}{!pending && data.sessions.map((session) => <SessionRow key={`${session.sessionId}-${session.startAt.toISOString()}`} session={session} onInspect={() => setSelected(session)} />)}</div>
    {data.pagination.totalPages > 1 && <div className="analytics-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.totalSessions} sessions</span><div><button disabled={pending || data.pagination.page === 1} onClick={() => load(filters, data.pagination.page - 1)}>← Newer</button><button disabled={pending || data.pagination.page === data.pagination.totalPages} onClick={() => load(filters, data.pagination.page + 1)}>Older →</button></div></div>}
    {selected && <SessionInspector session={selected} onClose={() => setSelected(null)} />}
  </section>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }

function SessionRow({ session, onInspect }: { session: Session; onInspect: () => void }) {
  return <article className="session-row"><time dateTime={session.startAt.toISOString()}>{formatCareerDateTime(session.startAt)}</time><div><strong>{session.visitorLabel}</strong><small>{session.returning ? "Returning visitor" : "New visitor"}</small></div><p>{session.device.device} · {session.device.browser} · {session.device.os}{session.device.crawler ? " · Known crawler" : ""}<br/>{session.location ? `${session.location} · approximate` : "Location unavailable"}<br/>{session.source.label}{session.source.detail ? ` · ${session.source.detail}` : ""}</p><p className="session-journey">{session.journey.map((step) => step.label).join(" → ")}</p><p>{session.pageCount} {session.pageCount === 1 ? "page" : "pages"} · {session.duration}</p>{session.engagement.length > 0 && <p className="session-engagement">{session.engagement.map((event) => event.label).join(" · ")}</p>}<button type="button" onClick={onInspect}>Inspect</button></article>;
}

function SessionInspector({ session, onClose }: { session: Session; onClose: () => void }) {
  const referrerDomain = (() => { try { return session.context?.referrer ? new URL(session.context.referrer).hostname : null; } catch { return "Referral"; } })();
  const attribution = session.context ? [["Referrer domain", referrerDomain], ["UTM source", session.context.utmSource], ["Medium", session.context.utmMedium], ["Campaign", session.context.utmCampaign], ["Content", session.context.utmContent], ["Term", session.context.utmTerm]].filter(([, value]) => value) : [];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", escape); previousFocus?.focus(); };
  }, [onClose]);
  const landing = session.journey[0]?.label;
  const exit = session.journey.at(-1)?.label;
  return <div className="session-inspector-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="session-inspector" role="dialog" aria-modal="true" aria-labelledby="session-inspector-title"><button ref={closeRef} className="inspector-close" type="button" onClick={onClose} aria-label="Close session details">×</button><h2 id="session-inspector-title">{session.visitorLabel}</h2><p>{session.returning ? "Returning visitor" : "New visitor"}</p><h3>Session</h3><dl><div><dt>Start</dt><dd>{formatCareerDateTime(session.startAt)}</dd></div><div><dt>Observed activity</dt><dd>{session.duration}</dd></div><div><dt>Landing / last</dt><dd>{landing === exit ? landing : `${landing} → ${exit}`}</dd></div></dl><h3>Journey</h3><ol className="inspector-journey">{session.journey.map((step, index) => <li key={`${step.path}-${step.visitedAt.toISOString()}-${index}`}><strong>{step.label}</strong><time>{formatCareerDateTime(step.visitedAt)}</time>{step.secondsToNext != null && <span>↓ {step.secondsToNext}s until next recorded page</span>}</li>)}</ol><h3>Attribution</h3><p>{session.source.label}{session.source.detail ? ` · ${session.source.detail}` : ""}</p>{attribution.length > 0 && <dl>{attribution.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<h3>Context</h3><p>{session.device.device} · {session.device.browser} · {session.device.os}<br/>{session.location ? `${session.location} · approximate` : "Location unavailable"}{session.context?.viewportWidth && session.context.viewportHeight ? <><br/>{session.context.viewportWidth}×{session.context.viewportHeight}</> : null}{session.context?.browserLanguage ? <><br/>Language: {session.context.browserLanguage}</> : null}{session.context?.browserTimezone ? <><br/>Browser timezone: {session.context.browserTimezone}</> : null}</p>{session.engagement.length > 0 && <><h3>Engagement</h3><ul>{session.engagement.map((event, index) => <li key={`${event.type}-${event.occurredAt.toISOString()}-${index}`}>{event.label}</li>)}</ul></>}<h3>Visitor history</h3><p>First seen: {formatCareerDateTime(session.visitor.firstSeen)}<br/>Last seen: {formatCareerDateTime(session.visitor.lastSeen)}<br/>{session.visitor.sessions} sessions · {session.visitor.pageViews} page views</p>{session.visitor.previousSessions.length > 0 && <div className="previous-sessions">{session.visitor.previousSessions.map((previous) => <article key={`${previous.sessionId}-${previous.startAt.toISOString()}`}><time>{formatCareerDateTime(previous.startAt)}</time><strong>{previous.journey.join(" → ")}</strong><span>{previous.pageCount} {previous.pageCount === 1 ? "page" : "pages"}</span></article>)}</div>}</section></div>;
}
