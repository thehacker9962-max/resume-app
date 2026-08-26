import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const pages = [
    { path: "", priority: 1.0, changefreq: "weekly" },
    { path: "/ats-checker", priority: 0.9, changefreq: "weekly" },
    { path: "/how-it-works", priority: 0.8, changefreq: "monthly" },
    { path: "/faq", priority: 0.7, changefreq: "monthly" },
    { path: "/about", priority: 0.5, changefreq: "yearly" },
    { path: "/contact", priority: 0.4, changefreq: "yearly" },
    { path: "/privacy", priority: 0.3, changefreq: "yearly" },
    { path: "/terms", priority: 0.3, changefreq: "yearly" },
    { path: "/cookies", priority: 0.3, changefreq: "yearly" },
    { path: "/disclaimer", priority: 0.3, changefreq: "yearly" },
  ];

  return pages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: today,
    changeFrequency: page.changefreq as any,
    priority: page.priority,
  }));
}
