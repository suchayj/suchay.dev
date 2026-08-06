import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Suchay Janbandhu — Senior Full Stack Engineer";
const description = "Senior Full Stack Engineer based in Pune, building enterprise platforms, modern web products, cloud-native systems and AI-enabled software.";

export const metadata: Metadata = {
  metadataBase: new URL("https://suchay.dev"),
  title,
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: "https://suchay.dev", siteName: "Suchay Janbandhu", type: "website", locale: "en_IN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Suchay Janbandhu — Senior Full Stack Engineer" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#171816" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
