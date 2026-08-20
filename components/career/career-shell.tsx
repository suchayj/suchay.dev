import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { ThemeToggle } from "@/app/theme-toggle";

const links = [["Dashboard", "/career"], ["Companies", "/career/companies"], ["Jobs", "/career/jobs"], ["Profile", "/career/profile"]] as const;

export function CareerShell({ children }: { children: React.ReactNode }) {
  return <div className="career-app">
    <header className="career-header">
      <Link className="wordmark" href="/" aria-label="Suchay home">Suchay<span>.</span><small>CareerOS</small></Link>
      <nav aria-label="CareerOS navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="career-account"><ThemeToggle /><form action={logoutAction}><button className="text-button" type="submit">Logout</button></form></div>
    </header>
    <main className="career-main" id="main-content">{children}</main>
  </div>;
}
