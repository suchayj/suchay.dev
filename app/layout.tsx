import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./career-os.css";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import { ContactProvider } from "./contact-modal";

const title = "Suchay Janbandhu — Full Stack, AI & Distributed Systems Engineer";
const description = "Pune-based Full Stack Engineer building Java and Spring Boot services, React and Next.js products, distributed systems and practical GenAI workflows.";

export const metadata: Metadata = {
  metadataBase: new URL("https://suchay.dev"),
  title,
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  authors: [{ name: "Suchay Janbandhu", url: "https://suchay.dev" }],
  creator: "Suchay Janbandhu",
  publisher: "Suchay Janbandhu",
  openGraph: { title, description, url: "https://suchay.dev", siteName: "Suchay Janbandhu", type: "website", locale: "en_IN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Suchay Janbandhu — Full Stack, AI and Distributed Systems Engineer" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#171816" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `try{var t=localStorage.getItem('suchay-theme')||'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark'}`;
  return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><ContactProvider>{children}<VisitorTracker /></ContactProvider></body></html>;
}
