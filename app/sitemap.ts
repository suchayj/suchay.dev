import type { MetadataRoute } from "next";
import { projects } from "./site-data";
export default function sitemap(): MetadataRoute.Sitemap { return [
  { url: "https://suchay.dev", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
  { url: "https://suchay.dev/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "https://suchay.dev/work", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: "https://suchay.dev/timeline", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "https://suchay.dev/capabilities", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "https://suchay.dev/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: "https://suchay.dev/resume", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ...projects.map(project => ({ url: `https://suchay.dev/work/${project.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
]; }
