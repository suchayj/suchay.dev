import type { PageVisit } from "@prisma/client";

type Summary = { todayVisitors: number; weekVisitors: number; topPages: { path: string; visits: number }[]; recentVisits: PageVisit[] };

function source(visit: PageVisit) {
  if (visit.utmSource) return visit.utmSource;
  if (!visit.referrer) return "Direct / unknown";
  try { return new URL(visit.referrer).hostname; } catch { return "Referral"; }
}

export function VisitorSummary({ data }: { data: Summary }) {
  return <section className="visitor-section" aria-labelledby="visitor-title">
    <div className="section-title"><p className="eyebrow"><span />Portfolio visitors</p><h2 id="visitor-title">What people are viewing.</h2></div>
    <dl className="visitor-metrics"><div><dt>Today</dt><dd>{data.todayVisitors}</dd></div><div><dt>Last 7 days</dt><dd>{data.weekVisitors}</dd></div></dl>
    <div className="analytics-grid"><article className="analytics-panel"><h3>Top pages · 7 days</h3>{data.topPages.length ? data.topPages.map((page) => <div className="analytics-row" key={page.path}><strong>{page.path}</strong><span>{page.visits} visits</span></div>) : <p className="analytics-empty">No portfolio visits recorded yet.</p>}</article>
      <article className="analytics-panel"><h3>Recent anonymous visits</h3>{data.recentVisits.length ? data.recentVisits.map((visit) => <div className="analytics-row recent-visit" key={visit.id}><time>{visit.visitedAt.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</time><strong>{visit.path}</strong><span>{[visit.city, visit.country].filter(Boolean).join(", ") || "Location unavailable"} · {source(visit)}</span></div>) : <p className="analytics-empty">No recent visits. Missing location and referrer data will appear as unavailable.</p>}</article></div>
  </section>;
}
