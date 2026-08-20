import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { PageHeading } from "@/components/career/page-heading";
import { requireUser } from "@/services/auth-service";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return <><PageHeading eyebrow="Profile" title="Account & security." description="The essentials for this private, single-user CareerOS account." /><div className="profile-grid"><section className="profile-card"><p className="index-label">Account / 01</p><h2>CareerOS owner</h2><dl><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Account type</dt><dd>Private · Single user</dd></div></dl></section><section className="profile-card"><p className="index-label">Security / 02</p><h2>Change password</h2><p>Use at least 8 characters. Your current session will remain active.</p><ChangePasswordForm /></section></div></>;
}
