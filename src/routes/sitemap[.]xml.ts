import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

const PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/ats-checker", priority: "0.9", changefreq: "weekly" },
  { path: "/how-it-works", priority: "0.8", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "yearly" },
  { path: "/contact", priority: "0.4", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
  { path: "/disclaimer", priority: "0.3", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const today = new Date().toISOString().slice(0, 10);
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  (page) =>
    `  <url><loc>${SITE_URL}${page.path}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`,
).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});