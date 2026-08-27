import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/career", "/login", "/resume/print"] }, sitemap: "https://suchay.dev/sitemap.xml", host: "https://suchay.dev" }; }
