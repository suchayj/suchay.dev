"use client";
import { useState } from "react";
import Link from "next/link";
import { convertCost, forecastCost, RATE_SOURCE, type CostLine } from "@/lib/voice/costs";
export type CallCost = { id: string; name: string; date: string; seconds: number | null; state: string; tracked: boolean; events: { kind: string; model: string; usd: number | null; issue: string | null; rateVersion: string; lines: CostLine[] }[] };
const usd = (value: number) => `$${value.toFixed(6)}`;
const rupees = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
export function CallCosts({ calls, totalUsd, totalCalls, unpricedEvents, page, hasNext }: { calls: CallCost[]; totalUsd: number; totalCalls: number; unpricedEvents: number; page: number; hasNext: boolean }) {
  const [fx, setFx] = useState(90);
  const [tax, setTax] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [volume, setVolume] = useState(100);
  const [share, setShare] = useState(50);
  const [model, setModel] = useState("gpt-realtime-2.1-mini");
  const local = (amount: number) => rupees(convertCost(amount, fx, tax));
  const forecast = forecastCost(minutes, volume, share / 100, model);
  return <>
    <section className="cost-settings"><div><h2>Your currency settings</h2><p>Conversion only. USD usage charges stay unchanged.</p></div><label>INR per US dollar<input type="number" min="1" max="1000" step="0.01" value={fx} onChange={event => setFx(Math.min(1000, Math.max(1, Number(event.target.value) || 1)))} /></label><label>Optional tax / markup (%)<input type="number" min="0" max="100" step="0.1" value={tax} onChange={event => setTax(Math.min(100, Math.max(0, Number(event.target.value) || 0)))} /></label><small>₹90 is an editable planning assumption, not a live exchange rate. Match your invoice/card rate for comparison.</small></section>
    <section className="cost-metrics" aria-label="Call costs in the last 30 days"><article><span>Known usage subtotal · 30 days</span><strong>{local(totalUsd)}</strong><small>{usd(totalUsd)} before optional markup</small></article><article><span>Voice attempts · 30 days</span><strong>{totalCalls}</strong><small>Includes failed and interrupted calls</small></article><article><span>Unpriced usage events</span><strong>{unpricedEvents}</strong><small>Missing detail or unsupported model; excluded from subtotal</small></article></section>
    <div className="cost-disclosure"><strong>Calculated from recorded API usage—not a final invoice.</strong><p>Audio, text and cached tokens are priced separately. Transcription and summary requests are included when usage is available. Old calls, missing events, interrupted monitoring, provider discounts and invoice adjustments can leave a gap. Totals cover retained enquiries; deleting an enquiry removes its cost records.</p></div>
    <section className="cost-history"><div className="section-title"><h2>Each conversation, itemised.</h2><p>Last 30 days · timestamps in IST · refresh after a call ends</p></div>
      {!calls.length && <div className="empty-state"><h3>No voice calls in this period.</h3><p>New calls will appear here automatically with their recorded usage.</p></div>}
      {calls.map(call => {
        const priced = call.events.filter(event => event.usd !== null);
        const amount = priced.reduce((sum, event) => sum + (event.usd ?? 0), 0);
        const incomplete = !call.tracked || call.events.some(event => event.usd === null) || !call.events.some(event => event.kind === "VOICE") || !call.events.some(event => event.kind === "TRANSCRIPTION") || !call.events.some(event => event.kind === "SUMMARY");
        return <article className="call-cost-card" key={call.id}><header><div><Link href={`/career/enquiries?enquiry=${encodeURIComponent(call.id)}`}><h3>{call.name}</h3></Link><p>{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(call.date))} IST · {call.seconds === null ? "Duration pending" : `${Math.floor(call.seconds / 60)}m ${call.seconds % 60}s`} · {call.state.toLowerCase().replaceAll("_", " ")}</p></div><div className="call-cost-total"><strong>{priced.length ? local(amount) : "Unavailable"}</strong><small>{priced.length ? `${usd(amount)} · ${incomplete ? "partial subtotal" : "recorded usage"}` : call.tracked ? "Awaiting detailed usage" : "Before cost tracking"}</small></div></header>
          <div className="call-cost-parts">{["VOICE", "TRANSCRIPTION", "SUMMARY"].map(kind => {
            const entries = call.events.filter(event => event.kind === kind);
            const known = entries.filter(event => event.usd !== null);
            return <div key={kind}><span>{kind === "VOICE" ? "AI conversation" : kind === "TRANSCRIPTION" ? "Speech transcription" : "Enquiry summary"}</span><b>{known.length ? local(known.reduce((sum, event) => sum + (event.usd ?? 0), 0)) : "Not available"}</b>{entries.some(event => event.usd === null) && <small>Some usage unpriced</small>}</div>;
          })}</div>
          <details><summary>Usage and pricing breakdown</summary>{!call.tracked && <p>Earlier calls stored combined token counts only. Their actual charge cannot be reconstructed reliably.</p>}{call.events.map((event, index) => <section key={index} className="cost-event"><h4>{event.kind.toLowerCase()} · {event.model}</h4><small>Rate snapshot: {event.rateVersion}</small>{event.issue && <p className="cost-warning">{event.issue}</p>}{event.lines.length > 0 && <div className="cost-table-wrap"><table><thead><tr><th>Usage</th><th>Tokens</th><th>USD / 1M</th><th>USD cost</th></tr></thead><tbody>{event.lines.map(line => <tr key={line.label}><td>{line.label}</td><td>{line.tokens.toLocaleString("en-IN")}</td><td>{line.rate}</td><td>{usd(line.usd)}</td></tr>)}</tbody></table></div>}</section>)}</details>
        </article>;
      })}
      <nav className="enquiry-pagination" aria-label="Cost pages">{page > 1 && <Link href={`/career/costs?page=${page - 1}`}>Previous</Link>}<span>Page {page}</span>{hasNext && <Link href={`/career/costs?page=${page + 1}`}>Next</Link>}</nav>
    </section>
    <section className="cost-planner"><p className="eyebrow">Plan ahead</p><h2>What would more calls cost?</h2><p>This estimates new speech audio only. Repeated conversation context, text, transcription and summaries add to it. Use the recorded call breakdown above to assess real usage.</p><div className="cost-planner-fields"><label>Voice model<select value={model} onChange={event => setModel(event.target.value)}><option value="gpt-realtime-2.1-mini">Realtime Mini</option><option value="gpt-realtime-2.1">Realtime</option></select></label><label>Minutes per call<input type="number" min="0.1" max="60" step="0.1" value={minutes} onChange={event => setMinutes(Math.max(.1, Math.min(60, Number(event.target.value) || .1)))} /></label><label>Number of calls<input type="number" min="1" max="100000" value={volume} onChange={event => setVolume(Math.max(1, Math.min(100000, Math.round(Number(event.target.value)) || 1)))} /></label><label>Assistant speaking time: {share}%<input type="range" min="0" max="100" value={share} onChange={event => setShare(Number(event.target.value))} /></label></div><div className="cost-projection"><strong>{local(forecast)}</strong><span>Speech-only estimate for {volume} calls · {local(forecast / volume)} per call</span></div><p className="voice-small">Standard rates checked 16 September 2026. <a href={RATE_SOURCE} target="_blank" rel="noreferrer">OpenAI pricing ↗</a>. Changing calculator settings does not change the live assistant or provider billing.</p></section>
  </>;
}
