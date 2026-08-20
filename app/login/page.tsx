import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/services/auth-service";

export const metadata: Metadata = { title: "Login — CareerOS", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/career");
  return <main className="login-page"><section className="login-intro"><Link className="wordmark" href="/">Suchay<span>.</span></Link><p className="eyebrow"><span />Private workspace</p><h1>Career momentum,<br/><em>made visible.</em></h1><p>A focused operating system for opportunities, decisions and the next move.</p></section><section className="login-panel"><div><p className="index-label">CareerOS / 01</p><h2>Welcome back.</h2><p>Sign in to continue to your private career workspace.</p><LoginForm /><Link className="back-link" href="/">← Return to suchay.dev</Link></div></section></main>;
}
