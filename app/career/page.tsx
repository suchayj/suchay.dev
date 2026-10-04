import Link from "next/link";
import { JobCard } from "@/components/career/job-card";
import { PageHeading } from "@/components/career/page-heading";
import { PipelineSummary } from "@/components/career/pipeline-summary";
import { getDashboardData } from "@/services/jobs-service";

export default async function DashboardPage() {
  const { priorityJobs, summary } = await getDashboardData();
  return <>
    <PageHeading eyebrow="Dashboard" title="Move the search forward." description="A grounded view of the roles worth attention and the actions already in motion." />
    <section className="career-focus"><div><p className="index-label">Career focus / 01</p><h2>Full Stack Engineer <em>+ GenAI</em></h2></div><div className="focus-locations"><span>Primary <strong>Pune</strong></span><span>Secondary <strong>Hyderabad / Nagpur</strong></span></div></section>
    <PipelineSummary summary={summary} />
    <section className="priority-section" aria-labelledby="priority-title"><div className="section-title row"><div><p className="eyebrow"><span />Priority opportunities</p><h2 id="priority-title">Worth a closer look.</h2></div><Link href="/career/jobs">View all jobs →</Link></div><div className="job-grid">{priorityJobs.map((job) => <JobCard job={job} compact key={job.id} />)}</div></section>
  </>;
}
