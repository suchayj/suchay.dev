import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/services/auth-service";
import { PageHeading } from "@/components/career/page-heading";
import { EnquiryControls } from "@/components/career/enquiry-controls";
import { voiceEnabled } from "@/lib/voice/validation";
export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries" };
const states: Record<string, string> = { SAVED: "Written enquiry", CONNECTING: "Connecting", ACTIVE: "In conversation", COMPLETED: "Completed", FAILED: "Couldn’t connect", INTERRUPTED: "Interrupted", LIMIT_REACHED: "Time limit reached" };
const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; enquiry?: string }> }) {
  await requireUser();
  const params = await searchParams;
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const status = ["NEW", "CONTACTED", "CLOSED"].includes(params.status ?? "") ? params.status! : "";
  const selectedEnquiry = /^[a-zA-Z0-9-]{1,64}$/.test(params.enquiry ?? "") ? params.enquiry : undefined;
  const where = selectedEnquiry ? { id: selectedEnquiry } : status ? { followUp: status } : {};
  const [enquiries, count] = await Promise.all([prisma.voiceEnquiry.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20 }), prisma.voiceEnquiry.count({ where })]);
  return <><PageHeading eyebrow="Enquiries" title="Conversations worth following up." description="Contact details, messages and AI voice conversations from your portfolio. Contact details are self-reported and unverified." />
    <p className="enquiry-config">{voiceEnabled() ? "AI voice is enabled." : "AI voice is off. Written enquiries are available. Set OPENAI_API_KEY and VOICE_ENABLED=true in Loom to enable voice."}</p>
    {selectedEnquiry && <p><Link href="/career/enquiries">← All enquiries</Link></p>}
    <form className="enquiry-filter"><label>Show<select name="status" defaultValue={status}><option value="">All enquiries</option><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option></select></label><button className="btn btn-secondary">Filter</button><span>{count} enquiries · times in IST</span></form>
    <div className="enquiry-list">{enquiries.map(enquiry => {
      const stale = ["ACTIVE", "CONNECTING"].includes(enquiry.state) && enquiry.startedAt && new Date().getTime() - enquiry.startedAt.getTime() > 6 * 60 * 1000;
      const duration = enquiry.startedAt && enquiry.endedAt ? Math.max(0, Math.round((enquiry.endedAt.getTime() - enquiry.startedAt.getTime()) / 1000)) : null;
      return <article className="enquiry-card" id={`enquiry-${enquiry.id}`} key={enquiry.id}><header><div><p className="index-label">{enquiry.reason} · {enquiry.followUp.toLowerCase()}</p><h2>{enquiry.name}</h2></div><time dateTime={enquiry.createdAt.toISOString()}>{date.format(enquiry.createdAt)}</time></header>
        <div className="enquiry-contact"><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>{enquiry.phone && <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>}<span>Contact details unverified</span></div>
        <p className="enquiry-message">{enquiry.message}</p><p className="enquiry-meta">{stale ? "Connection interrupted / status not confirmed" : states[enquiry.state] ?? enquiry.state}{duration !== null ? ` · ${Math.floor(duration / 60)}m ${duration % 60}s` : ""} · {enquiry.inputTokens + enquiry.outputTokens} voice tokens</p>
        {enquiry.summary && <section><h3>{enquiry.summaryKind === "AI" ? "AI summary · review for accuracy" : "Conversation note"}</h3><p className="enquiry-message">{enquiry.summary}</p></section>}
        {enquiry.transcript && <details><summary>Read conversation transcript</summary><p className="enquiry-transcript">{enquiry.transcript}</p></details>}
        <p><Link href="/career/costs">View call costs →</Link></p><EnquiryControls id={enquiry.id} status={enquiry.followUp} />
      </article>;
    })}</div>
    {!enquiries.length && <section className="empty-state"><h2>No enquiries here yet.</h2><p>Visitors can introduce themselves through the contact page.</p></section>}
    <nav className="enquiry-pagination" aria-label="Enquiry pages">{page > 1 && <Link href={`/career/enquiries?page=${page - 1}&status=${status}`}>Previous</Link>}<span>Page {page}</span>{page * 20 < count && <Link href={`/career/enquiries?page=${page + 1}&status=${status}`}>Next</Link>}</nav>
  </>;
}
