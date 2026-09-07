import type { PageVisit } from "@prisma/client";
import Link from "next/link";
import {
  formatCareerDate,
  formatCareerDateTime,
  todayDateInput,
  visitorFilterQuery,
  type VisitorFilter,
  type VisitorPreset,
} from "@/lib/analytics/visitor-presentation";

type Summary = {
  todayVisitors: number;
  weekVisitors: number;
  topPages: { path: string; visits: number }[];
  recentVisits: PageVisit[];
  pagination: { page: number; pageSize: number; totalVisits: number; totalPages: number };
  selectedUniqueVisitors: number;
  selectedSessions: number;
  filter: VisitorFilter;
  retention: { months: number; cutoff: Date };
};

const presets: { value: VisitorPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "day-before-yesterday", label: "Day before yesterday" },
  { value: "last-3", label: "Last 3 days" },
  { value: "last-4", label: "Last 4 days" },
  { value: "last-10", label: "Last 10 days" },
  { value: "all", label: "All retained history" },
];

function source(visit: PageVisit) {
  if (visit.utmSource) return visit.utmSource;
  if (!visit.referrer) return "Direct / unknown";
  try { return new URL(visit.referrer).hostname; } catch { return "Referral"; }
}

export function VisitorSummary({ data }: { data: Summary }) {
  const pageHref = (page: number) => {
    const query = visitorFilterQuery(data.filter);
    if (page > 1) query.set("visitsPage", String(page));
    return `/career${query.size ? `?${query}` : ""}#visitor-history`;
  };
  const today = todayDateInput();

  return <section className="visitor-section" id="visitor-history" aria-labelledby="visitor-title">
    <div className="section-title"><p className="eyebrow"><span />Portfolio visitors</p><h2 id="visitor-title">What people are viewing.</h2></div>
    <div className="visitor-filter-bar" aria-label="Filter visitor history by date">
      <div className="visitor-presets">{presets.map(({ value, label }) => <Link key={value} href={value === "all" ? "/career#visitor-history" : `/career?visitPreset=${value}#visitor-history`} aria-current={data.filter.preset === value ? "true" : undefined}>{label}</Link>)}</div>
      <form className={`visitor-date-range${data.filter.preset === "custom" ? " is-active" : ""}`} action="/career" method="get"><input type="hidden" name="visitPreset" value="custom" /><label>From<input type="date" name="visitStart" max={today} defaultValue={data.filter.start} required /></label><label>To<input type="date" name="visitEnd" max={today} defaultValue={data.filter.end} /></label><button type="submit">Apply dates</button></form>
      <p className="visitor-filter-summary" aria-live="polite"><strong>{data.filter.label}</strong><span>Calendar boundaries and displayed times use Asia/Kolkata.</span></p>
    </div>
    <dl className="visitor-metrics"><div><dt>Unique visitors · today</dt><dd>{data.todayVisitors}</dd></div><div><dt>Unique visitors · 7 days</dt><dd>{data.weekVisitors}</dd></div><div><dt>Page views · selection</dt><dd>{data.pagination.totalVisits}</dd></div><div><dt>Sessions · selection</dt><dd>{data.selectedSessions}</dd></div></dl>
    <p className="visitor-definition">Each row is one recorded page view. Unique visitors are browser-cookie identifiers; sessions are 30-minute activity windows. Neither is a verified person count.</p>
    <div className="analytics-grid"><article className="analytics-panel"><h3>Top pages · selection</h3>{data.topPages.length ? data.topPages.map((page) => <div className="analytics-row" key={page.path}><strong>{page.path}</strong><span>{page.visits} page views</span></div>) : <p className="analytics-empty">No page views match this date selection.</p>}<p className="retention-note">Retention window: {data.retention.months} calendar months · records before {formatCareerDate(data.retention.cutoff)} are eligible for cleanup.</p></article>
      <article className="analytics-panel"><div className="analytics-panel-heading"><h3>Visitor history</h3><span>{data.pagination.totalVisits} page views · {data.selectedUniqueVisitors} unique visitors</span></div>{data.recentVisits.length ? data.recentVisits.map((visit) => <div className="analytics-row recent-visit" key={visit.id}><time dateTime={visit.visitedAt.toISOString()}>{formatCareerDateTime(visit.visitedAt)}</time><strong>{visit.path}</strong><span>{[visit.city, visit.country].filter(Boolean).join(", ") || "Location unavailable"} · {source(visit)}</span></div>) : <div className="analytics-empty visitor-empty"><p>No visitor records match the selected IST dates.</p><Link href="/career#visitor-history">Clear filter</Link></div>}{data.pagination.totalPages > 1 && <nav className="analytics-pagination" aria-label="Visitor log pages"><span>Page {data.pagination.page} of {data.pagination.totalPages}</span><div>{data.pagination.page > 1 && <Link href={pageHref(data.pagination.page - 1)}>← Newer</Link>}{data.pagination.page < data.pagination.totalPages && <Link href={pageHref(data.pagination.page + 1)}>Older →</Link>}</div></nav>}</article></div>
  </section>;
}
