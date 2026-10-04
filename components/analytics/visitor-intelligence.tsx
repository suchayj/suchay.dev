"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { exportVisitorIntelligence, loadVisitorIntelligence } from "@/actions/visitor-actions";
import { formatCareerDateTime, todayDateInput } from "@/lib/analytics/visitor-presentation";
import { Download, Copy, Check, X } from "lucide-react";
import { formatSessionDetails, type VisitorExportFormat } from "@/lib/analytics/session-export";
import type { getSessionIntelligence, SessionFilters } from "@/services/analytics/session-intelligence";

type Data = Awaited<ReturnType<typeof getSessionIntelligence>>;
type Session = Data["sessions"][number];

const presets = [["all", "All retained"], ["today", "Today"], ["yesterday", "Yesterday"], ["day-before-yesterday", "Day before yesterday"], ["last-3", "Last 3 days"], ["last-4", "Last 4 days"], ["last-10", "Last 10 days"]] as const;

export function VisitorIntelligence({ initialData }: { initialData: Data }) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<SessionFilters>({ ownership: "external", preset: "all", visitor: "all", device: "all", source: "all" });
  const [selected, setSelected] = useState<Session | null>(null);
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<VisitorExportFormat | null>(null);
  const [exportStatus, setExportStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const requestNumber = useRef(0);
  const appliedFilters = useRef(filters);
  const closeInspector = useCallback(() => setSelected(null), []);

  const load = (nextFilters: SessionFilters, page = 1) => {
    const number = ++requestNumber.current;
    setFilters(nextFilters);
    setLoadError("");
    setExportStatus("");
    startTransition(async () => {
      try {
        const nextData = await loadVisitorIntelligence({ page, filters: nextFilters });
        if (number !== requestNumber.current) return;
        setData(nextData);
        appliedFilters.current = nextFilters;
      } catch {
        if (number !== requestNumber.current) return;
        setFilters(appliedFilters.current);
        setLoadError("Couldn’t load these filters. Please try again.");
      }
    });
  };

  const download = async (format: VisitorExportFormat) => {
    setExporting(format);
    setExportStatus("");
    try {
      const result = await exportVisitorIntelligence({ filters: appliedFilters.current, format });
      const url = URL.createObjectURL(new Blob([result.content], { type: result.contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportStatus(`${format.toUpperCase()} exported with all matching sessions.`);
    } catch {
      setExportStatus("Couldn’t export the data. Please try again.");
    } finally { setExporting(null); }
  };

  return <section className="visitor-section" aria-labelledby="visitor-title">
    <div className="visitor-heading">
      <div className="section-title"><p className="eyebrow"><span />Visitor activity</p><h2 id="visitor-title">Visits at a glance.</h2></div>
      <div className="visitor-export"><span>Export all {data.pagination.totalSessions} matching sessions</span><div className="visitor-export-buttons">
        <button type="button" disabled={pending || exporting !== null || !data.pagination.totalSessions} onClick={() => void download("csv")}><Download size={16} aria-hidden="true" />{exporting === "csv" ? "Preparing…" : "Export CSV"}</button>
        <button type="button" disabled={pending || exporting !== null || !data.pagination.totalSessions} onClick={() => void download("json")}><Download size={16} aria-hidden="true" />{exporting === "json" ? "Preparing…" : "Export JSON"}</button>
      </div><p role="status" aria-live="polite">{exportStatus}</p></div>
    </div>
    {loadError && <p className="visitor-load-error" role="alert">{loadError}</p>}
    <div className="visitor-filter-bar">
      <div className="visitor-presets">{presets.map(([value, label]) => <button key={value} type="button" aria-pressed={(filters.preset ?? "all") === value} onClick={() => load({ ...filters, preset: value, start: undefined, end: undefined })}>{label}</button>)}</div>
      <form className="visitor-date-range" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); load({ ...filters, preset: "custom", start: String(form.get("start")), end: String(form.get("end") || form.get("start")) }); }}><label>From<input name="start" type="date" max={todayDateInput()} required /></label><label>To<input name="end" type="date" max={todayDateInput()} /></label><button type="submit">Apply dates</button></form>
      <div className="visitor-select-filters"><label>Traffic<select value={filters.ownership} onChange={(e) => load({ ...filters, ownership: e.target.value as SessionFilters["ownership"] })}><option value="external">Visitors only</option><option value="own">Your devices</option><option value="all">All traffic</option></select></label><label>Visitor<select value={filters.visitor} onChange={(e) => load({ ...filters, visitor: e.target.value as SessionFilters["visitor"] })}><option value="all">All</option><option value="new">New</option><option value="returning">Returning</option></select></label><label>Device<select value={filters.device} onChange={(e) => load({ ...filters, device: e.target.value as SessionFilters["device"] })}><option value="all">All</option><option>Desktop</option><option>Mobile</option><option>Tablet</option><option>Unknown</option></select></label><label>Source<select value={filters.source} onChange={(e) => load({ ...filters, source: e.target.value as SessionFilters["source"] })}><option value="all">All</option><option>Direct</option><option>Google</option><option>LinkedIn</option><option>UTM/campaign</option><option>Other referral</option></select></label></div>
      <p className="visitor-filter-summary"><strong>{data.filter.label}</strong><span>All timestamps and calendar boundaries use IST.</span></p>
    </div>
    <dl className="visitor-metrics intelligence-metrics"><Metric label="Browsers" value={data.metrics.anonymousVisitors} /><Metric label="Sessions" value={data.metrics.sessions} /><Metric label="Page views" value={data.metrics.pageViews} /><Metric label="New visitors" value={data.metrics.newVisitors} /><Metric label="Returning visitors" value={data.metrics.returningVisitors} /><Metric label="Résumé views" value={data.metrics.resumeViews} /><Metric label="Contact opens" value={data.metrics.contactOpens} /><Metric label="Product opens" value={data.metrics.productOpens} /></dl>
    <p className="visitor-definition">Your devices are recognized after a successful CareerOS login in that browser, including earlier visits with the same cookie. Visitor references recognize the same browser using a cookie; they do not identify a person. Clearing cookies or using another browser creates a new reference. Sessions use the existing 30-minute session cookie; observed activity is only the interval between recorded page views.</p>
    <div className={`session-list${pending ? " is-loading" : ""}`} aria-busy={pending}>{pending && <p className="analytics-loading" role="status">Loading sessions…</p>}{!pending && !data.sessions.length && <div className="analytics-empty visitor-empty"><p>No sessions match these filters.</p><button type="button" onClick={() => load({ ownership: "external", preset: "all", visitor: "all", device: "all", source: "all" })}>Clear filters</button></div>}{!pending && data.sessions.map((session) => <SessionRow key={`${session.sessionId}-${session.startAt.toISOString()}`} session={session} onInspect={() => setSelected(session)} />)}</div>
    {data.pagination.totalPages > 1 && <div className="analytics-pagination"><span>Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.totalSessions} sessions</span><div><button disabled={pending || data.pagination.page === 1} onClick={() => load(filters, data.pagination.page - 1)}>← Newer</button><button disabled={pending || data.pagination.page === data.pagination.totalPages} onClick={() => load(filters, data.pagination.page + 1)}>Older →</button></div></div>}
    <p className="visitor-definition"><a href="https://db-ip.com" target="_blank" rel="noreferrer">IP Geolocation by DB-IP</a></p>
    {selected && <SessionInspector session={selected} onClose={closeInspector} />}
  </section>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }

function SessionRow({ session, onInspect }: { session: Session; onInspect: () => void }) {
  const name = session.ownerDeviceName ? `Your device · ${session.ownerDeviceName}` : session.visitorLabel;
  return <article className="session-row">
    <time className="session-time" dateTime={session.startAt.toISOString()}>{formatCareerDateTime(session.startAt)}</time>
    <div className="session-identity"><strong>{name}</strong><small>{session.returning ? "Returning visitor" : "New visitor"}</small></div>
    <div className="session-context"><p>{session.device.device} · {session.device.browser} · {session.device.os}</p><p className="session-muted">{session.location ? `${session.location} · network estimate` : "Location unavailable"}</p><p>{session.source.label}{session.source.detail ? ` · ${session.source.detail}` : ""}</p>{session.device.crawler && <small>Known crawler</small>}</div>
    <div className="session-path"><p className="session-journey" title={session.journey.map(step => step.label).join(" → ")}>{session.journey.map(step => step.label).join(" → ")}</p></div>
    <div className="session-activity"><p><strong>{session.pageCount} {session.pageCount === 1 ? "page view" : "page views"}</strong></p><p className="session-muted">{session.duration}</p>{session.engagement.length > 0 && <p className="session-engagement">{[...new Set(session.engagement.map(event => event.label))].join(" · ")}</p>}</div>
    <button className="session-inspect" type="button" aria-label={`Inspect ${name}`} onClick={onInspect}>Inspect <span aria-hidden="true">↗</span></button>
  </article>;
}

function SessionInspector({ session, onClose }: { session: Session; onClose: () => void }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keyboard); previousFocus?.focus(); };
  }, [onClose]);
  const copyDetails = async () => {
    try { await navigator.clipboard.writeText(formatSessionDetails(session)); setCopyStatus("copied"); }
    catch { setCopyStatus("failed"); }
  };
  const attribution = [["Referrer", session.context?.referrer], ["UTM source", session.context?.utmSource], ["Medium", session.context?.utmMedium], ["Campaign", session.context?.utmCampaign], ["Content", session.context?.utmContent], ["Term", session.context?.utmTerm]].filter(([, value]) => value);
  return <div className="session-inspector-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={panelRef} className="session-inspector" role="dialog" aria-modal="true" aria-labelledby="session-inspector-title" aria-describedby="session-inspector-description">
      <header className="inspector-header"><div><p className="eyebrow">Session details</p><h2 id="session-inspector-title">{session.visitorLabel}</h2><p id="session-inspector-description" className="inspector-subtitle">{session.ownerDeviceName ? `Your device · ${session.ownerDeviceName}` : session.returning ? "Returning visitor" : "New visitor"}</p></div><div className="inspector-actions"><button className="inspector-copy" type="button" onClick={() => void copyDetails()}>{copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copyStatus === "copied" ? "Copied!" : "Copy details"}</button><button ref={closeRef} className="inspector-close" type="button" onClick={onClose} aria-label="Close session details"><X size={20} aria-hidden="true" /></button></div></header>
      <div className="inspector-body"><p className="inspector-copy-status" role="status" aria-live="polite">{copyStatus === "failed" ? "Couldn’t access the clipboard. Select and copy the details manually." : copyStatus === "copied" ? "All session details copied to clipboard." : ""}</p>
        <section className="inspector-section"><h3>Session overview</h3><dl><Detail label="Started" value={formatCareerDateTime(session.startAt)} /><Detail label="Last page view" value={formatCareerDateTime(session.endAt)} /><Detail label="Page views" value={String(session.pageCount)} /><Detail label="Observed activity" value={session.duration} /><Detail label="Landing page" value={session.journey[0]?.label ?? "Not recorded"} /><Detail label="Last page" value={session.journey.at(-1)?.label ?? "Not recorded"} /></dl><p className="inspector-note">Activity measures time between recorded page views. Actions are listed separately below.</p></section>
        <section className="inspector-section"><h3>Device &amp; location</h3><dl><Detail label="Device" value={session.device.device} /><Detail label="Browser" value={session.device.browser} /><Detail label="Operating system" value={session.device.os} /><Detail label="Estimated location" value={session.location ? `${session.location} · network estimate` : "Location unavailable"} /><Detail label="Viewport" value={session.context?.viewportWidth && session.context.viewportHeight ? `${session.context.viewportWidth} × ${session.context.viewportHeight}` : "Not recorded"} /><Detail label="Language" value={session.context?.browserLanguage ?? "Not recorded"} /><Detail label="Browser time zone" value={session.context?.browserTimezone ?? "Not recorded"} />{session.device.crawler && <Detail label="Traffic type" value="Known crawler" />}</dl><p className="inspector-note">Location is estimated from the connection’s public IP, not GPS. It may show another area served by the internet provider; neighbourhood accuracy is not guaranteed.</p></section>
        <section className="inspector-section"><h3>Page journey</h3><ol className="inspector-journey">{session.journey.map((step, index) => <li key={`${step.path}-${step.visitedAt.toISOString()}-${index}`}><div><strong>{step.label}</strong><code>{step.path}</code></div><time dateTime={step.visitedAt.toISOString()}>{formatCareerDateTime(step.visitedAt)}</time>{step.secondsToNext != null && <span>↓ {step.secondsToNext}s until the next recorded page</span>}</li>)}</ol></section>
        <section className="inspector-section"><h3>Source &amp; campaign</h3><p>{session.source.label}{session.source.detail ? ` · ${session.source.detail}` : ""}</p>{attribution.length > 0 ? <dl>{attribution.map(([label, value]) => <Detail key={label} label={label!} value={value!} />)}</dl> : <p className="inspector-note">No referral or campaign information was recorded.</p>}</section>
        <section className="inspector-section"><h3>Recorded actions</h3>{session.engagement.length > 0 ? <ul className="inspector-events">{session.engagement.map((event, index) => <li key={`${event.type}-${event.occurredAt.toISOString()}-${index}`}><strong>{event.label}</strong><time dateTime={event.occurredAt.toISOString()}>{formatCareerDateTime(event.occurredAt)}</time></li>)}</ul> : <p className="inspector-note">No additional actions recorded.</p>}</section>
        <section className="inspector-section"><h3>Visitor history</h3><p className="inspector-note">This reference groups activity from one browser cookie. It is not a person’s name or a verified identity.</p><dl><Detail label="First seen" value={formatCareerDateTime(session.visitor.firstSeen)} /><Detail label="Last seen" value={formatCareerDateTime(session.visitor.lastSeen)} /><Detail label="Recorded sessions" value={String(session.visitor.sessions)} /><Detail label="Recorded page views" value={String(session.visitor.pageViews)} /></dl>{session.visitor.previousSessions.length > 0 && <><p className="inspector-note">Other recent sessions from this browser</p><div className="previous-sessions">{session.visitor.previousSessions.map(previous => <article key={`${previous.sessionId}-${previous.startAt.toISOString()}`}><time dateTime={previous.startAt.toISOString()}>{formatCareerDateTime(previous.startAt)}</time><strong>{previous.journey.join(" → ")}</strong><span>{previous.pageCount} {previous.pageCount === 1 ? "page view" : "page views"}</span></article>)}</div></>}</section>
        <footer className="inspector-footer">Session reference <code>{session.sessionId}</code></footer>
      </div>
    </section>
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
