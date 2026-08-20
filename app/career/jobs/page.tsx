import { JobCard } from "@/components/career/job-card";
import { PageHeading } from "@/components/career/page-heading";
import { listJobs } from "@/services/jobs-service";

export const metadata = { title: "Jobs" };

export default async function JobsPage() {
  const jobs = await listJobs();
  return <><PageHeading eyebrow="Jobs" title="Opportunity workspace." description="A small, factual pipeline. These initial records are manual examples and are not sourced from live job boards." />{jobs.length ? <div className="jobs-list">{jobs.map((job) => <JobCard job={job} key={job.id} />)}</div> : <section className="empty-state"><p className="index-label">No records / 00</p><h2>No opportunities yet.</h2><p>Seed or add an opportunity when there is something concrete to assess.</p></section>}</>;
}
