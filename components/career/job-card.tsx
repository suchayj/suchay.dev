import type { Job } from "@prisma/client";

function humanize(value: string) { return value.toLowerCase().replaceAll("_", " "); }

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  return <article className={`job-card${compact ? " compact" : ""}`}>
    <div className="job-meta"><span className="seed-label">Seeded opportunity</span><span>{job.location}</span></div>
    <h2>{job.title}</h2><p className="job-company">{job.company}</p>
    <div className="job-details"><span>Status <strong>{humanize(job.status)}</strong></span><span>Priority <strong>{humanize(job.priority)}</strong></span>{job.fitScore != null && <span>Manual fit <strong>{job.fitScore}%</strong></span>}</div>
    {!compact && <p className="job-source">Provenance: manual seed · Example planning record, not a web-discovered opening.</p>}
  </article>;
}
