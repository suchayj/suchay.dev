"use client";
import { useActionState } from "react";
import { updateEnquiry, deleteEnquiry } from "@/actions/enquiry-actions";
export function EnquiryControls({ id, status }: { id: string; status: string }) {
  const [updated, update, updating] = useActionState(updateEnquiry, { message: "" });
  const [deleted, remove, deleting] = useActionState(deleteEnquiry, { message: "" });
  return <div className="enquiry-controls"><form action={update}><input type="hidden" name="id" value={id} /><label>Follow-up<select name="status" defaultValue={status}><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option></select></label><button className="btn btn-secondary" disabled={updating}>{updating ? "Saving…" : "Save status"}</button><p role="status">{updated.message}</p></form><details><summary>Delete enquiry</summary><form action={remove}><input type="hidden" name="id" value={id} /><label><input type="checkbox" name="confirm" required /> Permanently delete these contact details and the conversation.</label><button className="btn btn-secondary" disabled={deleting}>{deleting ? "Deleting…" : "Delete enquiry"}</button><p role="status">{deleted.message}</p></form></details></div>;
}
