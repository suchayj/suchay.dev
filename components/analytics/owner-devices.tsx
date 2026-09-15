"use client";
import { useActionState } from "react";
import { renameOwnerDevice } from "@/actions/owner-device-actions";
import type { getOwnerDevices } from "@/services/owner-devices";
import { formatCareerDateTime } from "@/lib/analytics/visitor-presentation";
type Data = Awaited<ReturnType<typeof getOwnerDevices>>;
export function OwnerDevices({ data }: { data: Data }) {
  return <section className="visitor-section" aria-labelledby="owner-devices-title"><div className="section-title"><p className="eyebrow">Your activity</p><h2 id="owner-devices-title">Your devices &amp; sign-ins.</h2></div><p className="visitor-definition">Sign in to CareerOS once on each Mac or iPhone to recognize that browser. Give each one a name, such as “Suchay’s MacBook Air” or “Suchay’s iPhone”. Private browsing, another browser, or cleared cookies requires a new sign-in.</p><div className="owner-device-grid">{data.devices.map(device => <Device key={device.id} device={device} />)}</div>{!data.devices.length && <p>Sign out and sign in again to recognize this browser. Earlier login history is unavailable.</p>}<h3>Recent successful sign-ins</h3><p className="visitor-definition">Your latest 30 sign-ins, shown in IST. Visitor totals exclude your recognized browsers by default.</p><div className="owner-login-list">{data.logins.map(login => <p key={login.id}><strong>You signed in · {login.name}{login.current ? " · This browser" : ""}</strong><time dateTime={login.occurredAt.toISOString()}>{formatCareerDateTime(login.occurredAt)}</time></p>)}</div></section>;
}
function Device({ device }: { device: Data["devices"][number] }) {
  const [state, action, pending] = useActionState(renameOwnerDevice, { message: "" });
  return <form action={action} className="owner-device-card"><input type="hidden" name="id" value={device.id}/><label htmlFor={`device-${device.id}`}>{device.current ? "This browser · Your device" : "Your device"}</label><input id={`device-${device.id}`} name="name" defaultValue={device.name} maxLength={60} required/><small>Last sign-in: {formatCareerDateTime(device.lastLoginAt)}</small><button disabled={pending}>{pending ? "Saving…" : "Save name"}</button><p role="status">{state.message}</p></form>;
}
