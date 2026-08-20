type Summary = { highPriority: number; shortlisted: number; applied: number; interview: number };

export function PipelineSummary({ summary }: { summary: Summary }) {
  const items = [["High priority", summary.highPriority], ["Shortlisted", summary.shortlisted], ["Applied", summary.applied], ["Interview", summary.interview]] as const;
  return <section aria-labelledby="pipeline-title"><div className="section-title"><p className="eyebrow"><span />Current pipeline</p><h2 id="pipeline-title">Execution at a glance.</h2></div><div className="metric-grid">{items.map(([label, value]) => <article key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></article>)}</div></section>;
}
