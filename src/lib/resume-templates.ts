import type { ResumeData } from "./builder.schemas";

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "sidebar"
  | "compact"
  | "executive"
  | "timeline"
  | "academic"
  | "photo-modern"
  | "photo-sidebar"
  | "photo-elegant"
  | "creative-gradient"
  | "photo-executive"
  | "tech-minimal"
  | "enhancv-joanna"
  | "enhancv-pablo"
  | "enhancv-will";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  tagline: string;
  bestFor: string;
  accent: string;
  photo?: boolean;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic Serif",
    tagline: "Centred header, ruled section headings, Times-style serif.",
    bestFor: "Finance, law, academia, government",
    accent: "#1f2937",
  },
  {
    id: "modern",
    name: "Modern Accent",
    tagline: "Clean sans-serif with an emerald accent rail on headings.",
    bestFor: "Tech, product, marketing",
    accent: "#0f766e",
  },
  {
    id: "minimal",
    name: "Minimal Air",
    tagline: "Generous whitespace, light weights, no rules or colour.",
    bestFor: "Design, UX, consulting",
    accent: "#111827",
  },
  {
    id: "sidebar",
    name: "Sidebar Pro",
    tagline: "Left rail with contact, skills and education.",
    bestFor: "Engineering, data, operations",
    accent: "#1d4ed8",
  },
  {
    id: "compact",
    name: "Compact One-Page",
    tagline: "Dense two-column skills, tight spacing to fit one page.",
    bestFor: "Senior profiles with long histories",
    accent: "#334155",
  },
  {
    id: "executive",
    name: "Executive Bold",
    tagline: "Full-width name band with uppercase, high-contrast headings.",
    bestFor: "Directors, managers, senior sales",
    accent: "#0f172a",
  },
  {
    id: "timeline",
    name: "Timeline",
    tagline: "Vertical rule with dated milestones down the experience column.",
    bestFor: "Career changers, project-heavy roles",
    accent: "#b45309",
  },
  {
    id: "academic",
    name: "Academic CV",
    tagline: "Serif, small caps headings, room for publications and certifications.",
    bestFor: "Research, teaching, PhD applications",
    accent: "#4c1d95",
  },
  {
    id: "photo-modern",
    name: "Photo Modern",
    tagline: "Round headshot beside the name with an emerald accent bar.",
    bestFor: "Client-facing, sales, hospitality",
    accent: "#0f766e",
    photo: true,
  },
  {
    id: "photo-sidebar",
    name: "Photo Sidebar",
    tagline: "Tinted left rail with headshot, contact details and skills.",
    bestFor: "Design, marketing, international CVs",
    accent: "#1d4ed8",
    photo: true,
  },
  {
    id: "photo-elegant",
    name: "Photo Elegant",
    tagline: "Centred headshot above a serif nameplate and ruled sections.",
    bestFor: "Europe/Middle East CVs, academia",
    accent: "#7c2d12",
    photo: true,
  },
  {
    id: "creative-gradient",
    name: "Creative Indigo Gradient",
    tagline: "Vibrant gradient headers with clean monospace tags for creative tech roles.",
    bestFor: "Designers, UX, frontend engineers, marketers",
    accent: "#6366f1",
  },
  {
    id: "photo-executive",
    name: "Photo Executive",
    tagline: "Ruled dual-column layout with a photo band and high-status serif header.",
    bestFor: "Executives, project managers, consultants",
    accent: "#1e3a8a",
    photo: true,
  },
  {
    id: "tech-minimal",
    name: "Tech Minimalist",
    tagline: "Clean monospace accent elements, structured grid borders, best for devs.",
    bestFor: "Software developers, sysadmins, DevOps",
    accent: "#0d9488",
  },
  {
    id: "enhancv-joanna",
    name: "Joanna Nelson Style",
    tagline: "Sage sidebar, round photo overlays, solid green pill subtitle, and section headers with circle badge icons.",
    bestFor: "Startups, creative leaders, founders",
    accent: "#10b981",
    photo: true,
  },
  {
    id: "enhancv-pablo",
    name: "Pablo Cruz Style",
    tagline: "Bold top header, photo on right, horizontal contacts list, and side-by-side strengths block.",
    bestFor: "Managers, engineers, account directors",
    accent: "#2563eb",
    photo: true,
  },
  {
    id: "enhancv-will",
    name: "Will Lee Style",
    tagline: "Sleek timeline dots, vertical experience timeline rules, and horizontal progress bars.",
    bestFor: "Consultants, project leads, data analysts",
    accent: "#3b82f6",
  },
];

export const PHOTO_TEMPLATES = TEMPLATES.filter((t) => t.photo).map((t) => t.id);

export function templateSupportsPhoto(id: TemplateId): boolean {
  return TEMPLATES.some((t) => t.id === id && t.photo);
}

function esc(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function contactLine(data: ResumeData): string {
  return [data.email, data.phone, data.location, data.website, data.linkedin]
    .filter((part) => part && part.trim())
    .map((part) => esc(part))
    .join(" &nbsp;•&nbsp; ");
}

function section(title: string, body: string): string {
  if (!body.trim()) return "";
  return `<section class="sec"><h2>${esc(title)}</h2>${body}</section>`;
}

function experienceBlock(data: ResumeData): string {
  return data.experience
    .filter((job) => job.role || job.company)
    .map(
      (job) => `<div class="item">
        <div class="row"><span class="strong">${esc(job.role)}</span><span class="meta">${esc(job.period)}</span></div>
        <div class="row"><span class="sub">${[job.company, job.location].filter(Boolean).map(esc).join(" — ")}</span></div>
        ${
          job.bullets.filter(Boolean).length
            ? `<ul>${job.bullets.filter(Boolean).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");
}

function educationBlock(data: ResumeData): string {
  return data.education
    .filter((ed) => ed.degree || ed.school)
    .map(
      (ed) => `<div class="item">
        <div class="row"><span class="strong">${esc(ed.degree)}</span><span class="meta">${esc(ed.period)}</span></div>
        <div class="row"><span class="sub">${esc(ed.school)}</span></div>
        ${ed.detail ? `<p>${esc(ed.detail)}</p>` : ""}
      </div>`,
    )
    .join("");
}

function projectsBlock(data: ResumeData): string {
  return data.projects
    .filter((p) => p.name || p.description)
    .map(
      (p) => `<div class="item">
        <div class="row"><span class="strong">${esc(p.name)}</span><span class="meta">${esc(p.tech)}</span></div>
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
      </div>`,
    )
    .join("");
}

function skillsInline(data: ResumeData): string {
  const skills = data.skills.filter(Boolean);
  if (!skills.length) return "";
  return `<p class="skills">${skills.map(esc).join(" &nbsp;•&nbsp; ")}</p>`;
}

function skillsTags(data: ResumeData): string {
  const skills = data.skills.filter(Boolean);
  if (!skills.length) return "";
  return `<div class="skills">${skills.map((s) => `<span>${esc(s)}</span>`).join("")}</div>`;
}

function certsBlock(data: ResumeData): string {
  const items = data.certifications.filter(Boolean);
  if (!items.length) return "";
  return `<ul>${items.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
}

function internshipsBlock(data: ResumeData): string {
  const items = data.internships || [];
  if (!items.length) return "";
  return items
    .filter((job) => job.role || job.company)
    .map(
      (job) => `<div class="item">
        <div class="row"><span class="strong">${esc(job.role)} (Internship)</span><span class="meta">${esc(job.period)}</span></div>
        <div class="row"><span class="sub">${[job.company, job.location].filter(Boolean).map(esc).join(" — ")}</span></div>
        ${
          job.bullets.filter(Boolean).length
            ? `<ul>${job.bullets.filter(Boolean).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");
}

function leadershipBlock(data: ResumeData): string {
  const items = data.leadership || [];
  if (!items.length) return "";
  return items
    .filter((job) => job.role || job.company)
    .map(
      (job) => `<div class="item">
        <div class="row"><span class="strong">${esc(job.role)}</span><span class="meta">${esc(job.period)}</span></div>
        <div class="row"><span class="sub">${[job.company, job.location].filter(Boolean).map(esc).join(" — ")}</span></div>
        ${
          job.bullets.filter(Boolean).length
            ? `<ul>${job.bullets.filter(Boolean).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");
}

function achievementsBlock(data: ResumeData): string {
  const items = data.keyAchievements || [];
  if (!items.length) return "";
  return `<ul>${items.filter(Boolean).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
}

function initials(name: string): string {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function photoBlock(data: ResumeData): string {
  if (data.photo && typeof data.photo === "string" && /^(https?:|data:image\/|\/)/i.test(data.photo.trim())) {
    return `<img class="photo" src="${esc(data.photo.trim())}" alt="${esc(data.name || "Profile photo")}" />`;
  }
  return `<div class="photo-fallback">${esc(initials(data.name) || "•")}</div>`;
}

function contactStack(data: ResumeData): string {
  const parts = [data.email, data.phone, data.location, data.website, data.linkedin].filter(
    (part) => part && typeof part === "string" && part.trim(),
  );
  if (!parts.length) return "";
  return `<ul class="contact-list">${parts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;
}

const BASE_CSS = `
.rz { color: #111827; line-height: 1.42; }
.rz * { box-sizing: border-box; font-family: inherit; }
.rz h1, .rz h2 { font-weight: 700; }
.rz h1 { margin: 0; font-size: 24pt; letter-spacing: -0.2pt; }
.rz .headline { margin: 2mm 0 0; font-size: 10.5pt; }
.rz .contact { margin: 2mm 0 0; font-size: 9pt; color: #374151; }
.rz .sec { margin-top: 5mm; break-inside: avoid; page-break-inside: avoid; }
.rz .sec h2 { margin: 0 0 2mm; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1pt; break-after: avoid; page-break-after: avoid; }
.rz .item { margin-bottom: 3mm; break-inside: avoid; page-break-inside: avoid; }
.rz .row { display: flex; justify-content: space-between; gap: 6mm; align-items: baseline; }
.rz .strong { font-weight: 700; font-size: 10.5pt; }
.rz .sub { font-size: 10pt; color: #374151; }
.rz .meta { font-size: 9pt; color: #4b5563; white-space: nowrap; }
.rz p { margin: 1.5mm 0 0; font-size: 10pt; }
.rz ul { margin: 1.5mm 0 0; padding-left: 5mm; }
.rz li { font-size: 10pt; margin-bottom: 1mm; break-inside: avoid; page-break-inside: avoid; }
.rz .skills { font-size: 10pt; }
.rz a { color: inherit; text-decoration: none; }
.rz .photo { width: 30mm; height: 30mm; object-fit: cover; display: block; }
.rz .photo-fallback { width: 30mm; height: 30mm; display: flex; align-items: center; justify-content: center;
  background: #e5e7eb; color: #4b5563; font-size: 14pt; font-weight: 700; }
.rz .head-flex { display: flex; align-items: center; gap: 6mm; }
.rz .head-flex .head-text { flex: 1; }
`;

const THEME_CSS: Record<TemplateId, string> = {
  classic: `
.rz { font-family: "Times New Roman", Times, serif; }
.rz header { text-align: center; border-bottom: 1.2pt solid #1f2937; padding-bottom: 3mm; }
.rz .sec h2 { border-bottom: 0.6pt solid #9ca3af; padding-bottom: 1mm; }
`,
  modern: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { color: #0f766e; }
.rz header { border-bottom: 2pt solid #0f766e; padding-bottom: 3mm; }
.rz .sec h2 { color: #0f766e; border-left: 2.5pt solid #0f766e; padding-left: 2.5mm; }
`,
  minimal: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { font-weight: 300; font-size: 26pt; }
.rz .sec { margin-top: 7mm; }
.rz .sec h2 { font-weight: 500; color: #6b7280; letter-spacing: 2pt; }
.rz .strong { font-weight: 600; }
`,
  sidebar: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { color: #1d4ed8; font-size: 22pt; }
.rz .grid { display: flex; gap: 8mm; margin-top: 5mm; }
.rz .rail { width: 58mm; flex: none; border-right: 0.6pt solid #d1d5db; padding-right: 6mm; }
.rz .body { flex: 1; }
.rz .sec h2 { color: #1d4ed8; }
.rz .rail .sec { margin-top: 0; margin-bottom: 6mm; }
.rz .rail p, .rz .rail li { font-size: 9pt; }
`,
  compact: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; line-height: 1.32; }
.rz h1 { font-size: 20pt; }
.rz .sec { margin-top: 3.5mm; }
.rz .item { margin-bottom: 2mm; }
.rz .sec h2 { background: #f1f5f9; padding: 1mm 2mm; letter-spacing: 0.8pt; }
.rz li, .rz p, .rz .sub, .rz .skills { font-size: 9.5pt; }
.rz .skills { column-count: 2; column-gap: 8mm; }
`,
  executive: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz header { background: #0f172a; color: #fff; padding: 5mm 6mm; margin: -2mm -6mm 0; }
.rz h1 { color: #fff; text-transform: uppercase; letter-spacing: 1.5pt; font-size: 20pt; }
.rz header .headline, .rz header .contact { color: #e2e8f0; }
.rz .sec h2 { border-bottom: 1.5pt solid #0f172a; padding-bottom: 1mm; }
`,
  timeline: `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { color: #b45309; }
.rz header { border-bottom: 1pt solid #d6d3d1; padding-bottom: 3mm; }
.rz .sec h2 { color: #b45309; }
.rz .item { position: relative; padding-left: 6mm; border-left: 1.2pt solid #e7e5e4; }
.rz .item::before { content: ""; position: absolute; left: -1.6mm; top: 1.6mm; width: 3mm; height: 3mm;
  border-radius: 50%; background: #b45309; }
`,
  academic: `
.rz { font-family: Georgia, "Times New Roman", serif; font-size: 10.5pt; }
.rz header { text-align: left; border-bottom: 0.8pt solid #4c1d95; padding-bottom: 3mm; }
.rz h1 { color: #4c1d95; font-size: 22pt; }
.rz .sec h2 { font-variant: small-caps; text-transform: none; letter-spacing: 0.5pt; color: #4c1d95; font-size: 12pt; }
.rz .sec { margin-top: 6mm; }
`,
  "photo-modern": `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { color: #0f766e; }
.rz header { border-bottom: 2pt solid #0f766e; padding-bottom: 3mm; }
.rz .photo, .rz .photo-fallback { border-radius: 50%; border: 1.5pt solid #0f766e; }
.rz .sec h2 { color: #0f766e; border-left: 2.5pt solid #0f766e; padding-left: 2.5mm; }
`,
  "photo-sidebar": `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { color: #1d4ed8; font-size: 21pt; }
.rz .grid { display: flex; gap: 7mm; }
.rz .rail { width: 58mm; flex: none; background: #eff5ff; padding: 5mm; margin-top: -2mm; }
.rz .body { flex: 1; }
.rz .rail .photo, .rz .rail .photo-fallback { width: 38mm; height: 38mm; border-radius: 3mm; margin: 0 auto 4mm; }
.rz .rail .sec { margin-top: 0; margin-bottom: 5mm; }
.rz .rail p, .rz .rail li { font-size: 9pt; }
.rz .rail h2 { color: #1d4ed8; }
.rz .sec h2 { color: #1d4ed8; }
.rz .contact-list { list-style: none; padding: 0; margin: 0; }
`,
  "photo-elegant": `
.rz { font-family: "Times New Roman", Times, serif; }
.rz header { text-align: center; border-bottom: 0.8pt solid #7c2d12; padding-bottom: 3mm; }
.rz .photo, .rz .photo-fallback { width: 32mm; height: 32mm; border-radius: 50%; margin: 0 auto 3mm; border: 1pt solid #7c2d12; }
.rz h1 { color: #7c2d12; letter-spacing: 1pt; }
.rz .sec h2 { color: #7c2d12; border-bottom: 0.5pt solid #d6d3d1; padding-bottom: 1mm; }
`,
  "creative-gradient": `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
.rz h1 { font-size: 26pt; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.rz header { border-bottom: 1.5pt solid #e5e7eb; padding-bottom: 4mm; }
.rz .sec h2 { color: #6366f1; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.5pt; }
.rz .skills { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 1.5mm; }
.rz .skills span { font-size: 8.5pt; background: #e0e7ff; color: #3730a3; padding: 1mm 2.5mm; border-radius: 4px; font-weight: 500; }
`,
  "photo-executive": `
.rz { font-family: Georgia, serif; font-size: 10.5pt; }
.rz header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2pt solid #1e3a8a; padding-bottom: 4mm; }
.rz h1 { color: #1e3a8a; font-size: 24pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.rz .photo, .rz .photo-fallback { width: 28mm; height: 28mm; border-radius: 0; border: 2pt solid #1e3a8a; }
.rz .sec h2 { color: #1e3a8a; border-bottom: 1px solid #1e3a8a; padding-bottom: 1mm; font-size: 11pt; font-weight: 700; }
`,
  "tech-minimal": `
.rz { font-family: Courier, monospace; font-size: 9.5pt; line-height: 1.35; }
.rz h1 { font-size: 22pt; font-weight: 700; color: #0d9488; }
.rz header { border-bottom: 1px dashed #9ca3af; padding-bottom: 3mm; }
.rz .sec h2 { color: #0d9488; border-bottom: 1px dashed #0d9488; padding-bottom: 0.5mm; font-size: 9.5pt; font-weight: 700; }
.rz .strong { color: #0f172a; font-weight: 700; }
.rz .item { border-left: 1px dotted #cbd5e1; padding-left: 3.5mm; margin-bottom: 3.5mm; }
`,
  "enhancv-joanna": `
.rz { font-family: "Space Grotesk", sans-serif; font-size: 9.5pt; line-height: 1.4; }
.rz .grid { display: flex; gap: 6mm; margin-top: 4mm; }
.rz .rail { width: 64mm; flex: none; background: #f0fdf4; padding: 6mm 4mm; border-radius: 8px; }
.rz .body { flex: 1; }
.rz h1 { font-size: 26pt; font-weight: 700; color: #111827; }
.rz .headline-pill { display: inline-block; background: #a7f3d0; color: #065f46; font-size: 8.5pt; font-weight: 700; padding: 1.5mm 3.5mm; border-radius: 20px; text-transform: uppercase; margin-top: 2.5mm; letter-spacing: 0.5px; }
.rz .photo-container { position: relative; width: 34mm; height: 34mm; margin: 0 auto 5mm; }
.rz .photo-bg-shapes { position: absolute; inset: -4px; border-radius: 50%; background: linear-gradient(135deg, #a7f3d0 0%, #34d399 100%); z-index: 1; opacity: 0.7; }
.rz .photo, .rz .photo-fallback { position: relative; width: 34mm; height: 34mm; border-radius: 50%; z-index: 2; border: 2pt solid #fff; margin: 0 auto; }
.rz .sec h2 { color: #065f46; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 2mm; border-bottom: none; }
.rz .sec h2::before { content: "✓"; color: #059669; font-size: 11pt; background: #d1fae5; width: 5.5mm; height: 5.5mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 1mm; font-weight: 800; }
.rz .contact-list { list-style: none; padding: 0; margin: 0; }
.rz .contact-list li { font-size: 9pt; margin-bottom: 2mm; display: flex; align-items: center; gap: 2mm; word-break: break-all; }
.rz .skills-list { display: flex; flex-direction: column; gap: 1.5mm; }
.rz .skills-list span { font-weight: 500; font-size: 9pt; color: #374151; }
`,
  "enhancv-pablo": `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; }
.rz header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e1b4b; padding-bottom: 3.5mm; }
.rz h1 { color: #1e1b4b; font-size: 26pt; font-weight: 800; text-transform: uppercase; }
.rz .subtitle-blue { color: #2563eb; font-size: 10.5pt; font-weight: 700; margin-top: 1.5mm; }
.rz .contact-horizontal { display: flex; flex-wrap: wrap; gap: 4mm; font-size: 9pt; color: #4b5563; margin-top: 2.5mm; }
.rz .photo, .rz .photo-fallback { width: 28mm; height: 28mm; border-radius: 50%; border: 2pt solid #2563eb; }
.rz .sec h2 { color: #1e1b4b; border-bottom: 2px solid #1e1b4b; padding-bottom: 1mm; font-size: 11pt; font-weight: 700; text-transform: uppercase; margin-top: 5mm; }
.rz .skills-table { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 2mm; }
.rz .skills-table span { border-bottom: 2px solid #e2e8f0; padding: 1.5mm 3mm; font-weight: 500; background: #f8fafc; font-size: 9pt; border-radius: 4px; }
.rz .skills-table span:hover { border-bottom-color: #2563eb; }
`,
  "enhancv-will": `
.rz { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; }
.rz h1 { font-size: 28pt; font-weight: 800; color: #111827; }
.rz .headline-will { color: #4b5563; font-size: 11pt; font-weight: 500; border-bottom: 1px solid #e5e7eb; padding-bottom: 3mm; margin-top: 1.5mm; }
.rz .sec h2 { color: #111827; font-size: 11pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5pt solid #111827; padding-bottom: 1mm; }
.rz .timeline-wrapper { position: relative; padding-left: 6mm; margin-top: 4mm; }
.rz .timeline-line { position: absolute; left: 1.5mm; top: 2mm; bottom: 2mm; width: 1.5pt; background: #e5e7eb; }
.rz .timeline-item { position: relative; margin-bottom: 5mm; }
.rz .timeline-dot { position: absolute; left: -5.7mm; top: 1.5mm; width: 3.5mm; height: 3.5mm; border-radius: 50%; background: #111827; border: 1.5pt solid #fff; }
.rz .skills-table { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 2mm; }
.rz .skills-table span { border: 1px solid #d1d5db; padding: 1mm 2.5mm; font-weight: 500; font-size: 9pt; border-radius: 4px; }
`,
};

export function templateCss(id: TemplateId, scope = "rz"): string {
  const css = `${BASE_CSS}\n${THEME_CSS[id]}`;
  return scope === "rz" ? css : css.replace(/\.rz\b/g, `.${scope}`);
}

export function renderResumeHtml(id: TemplateId, data: ResumeData, scope = "rz"): string {
  const header = `<header>
    <h1>${esc(data.name || "Your Name")}</h1>
    ${data.headline ? `<p class="headline">${esc(data.headline)}</p>` : ""}
    ${contactLine(data) ? `<p class="contact">${contactLine(data)}</p>` : ""}
  </header>`;

  const summary = section("Summary", data.summary ? `<p>${esc(data.summary)}</p>` : "");
  const skills = section("Skills", skillsInline(data));
  const experience = section("Experience", experienceBlock(data));
  const projects = section("Projects", projectsBlock(data));
  const education = section("Education", educationBlock(data));
  const certs = section("Certifications", certsBlock(data));
  const internships = section("Internships", internshipsBlock(data));
  const leadership = section("Leadership & Community", leadershipBlock(data));
  const achievements = section("Key Achievements", achievementsBlock(data));

  if (id === "sidebar") {
    const railSkills = data.skills.filter(Boolean).length
      ? section("Skills", `<ul>${data.skills.filter(Boolean).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`)
      : "";
    return `<div class="${scope}">${header}
      <div class="grid">
        <aside class="rail">${railSkills}${education}${certs}</aside>
        <div class="body">${summary}${experience}${internships}${projects}${leadership}${achievements}</div>
      </div>
    </div>`;
  }

  if (id === "photo-modern") {
    const photoHeader = `<header><div class="head-flex">${photoBlock(data)}<div class="head-text">
      <h1>${esc(data.name || "Your Name")}</h1>
      ${data.headline ? `<p class="headline">${esc(data.headline)}</p>` : ""}
      ${contactLine(data) ? `<p class="contact">${contactLine(data)}</p>` : ""}
    </div></div></header>`;
    return `<div class="${scope}">${photoHeader}${summary}${skills}${experience}${internships}${projects}${education}${certs}${leadership}${achievements}</div>`;
  }

  if (id === "photo-elegant") {
    const photoHeader = `<header>${photoBlock(data)}
      <h1>${esc(data.name || "Your Name")}</h1>
      ${data.headline ? `<p class="headline">${esc(data.headline)}</p>` : ""}
      ${contactLine(data) ? `<p class="contact">${contactLine(data)}</p>` : ""}
    </header>`;
    return `<div class="${scope}">${photoHeader}${summary}${skills}${experience}${internships}${projects}${education}${certs}${leadership}${achievements}</div>`;
  }

  if (id === "photo-sidebar") {
    const railSkills = data.skills.filter(Boolean).length
      ? section("Skills", `<ul>${data.skills.filter(Boolean).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`)
      : "";
    const railContact = section("Contact", contactStack(data));
    return `<div class="${scope}">
      <div class="grid">
        <aside class="rail">${photoBlock(data)}${railContact}${railSkills}${education}${certs}</aside>
        <div class="body">
          <header>
            <h1>${esc(data.name || "Your Name")}</h1>
            ${data.headline ? `<p class="headline">${esc(data.headline)}</p>` : ""}
          </header>
          ${summary}${experience}${internships}${projects}${leadership}${achievements}
        </div>
      </div>
    </div>`;
  }

  if (id === "photo-executive") {
    const photoHeader = `<header>
      <div class="head-text">
        <h1>${esc(data.name || "Your Name")}</h1>
        ${data.headline ? `<p class="headline">${esc(data.headline)}</p>` : ""}
        ${contactLine(data) ? `<p class="contact">${contactLine(data)}</p>` : ""}
      </div>
      ${photoBlock(data)}
    </header>`;
    return `<div class="${scope}">${photoHeader}${summary}${skills}${experience}${internships}${projects}${education}${certs}${leadership}${achievements}</div>`;
  }

  if (id === "creative-gradient") {
    const creativeSkills = section("Skills", skillsTags(data));
    return `<div class="${scope}">${header}${summary}${creativeSkills}${experience}${internships}${projects}${education}${certs}${leadership}${achievements}</div>`;
  }

  if (id === "enhancv-joanna") {
    const railSkills = data.skills.filter(Boolean).length
      ? section("Skills", `<div class="skills-list">${data.skills.filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join("")}</div>`)
      : "";
    const railContact = section("Contacts", contactStack(data));
    const joannaHeader = `<header>
      <h1>${esc(data.name || "Your Name")}</h1>
      ${data.headline ? `<div class="headline-pill">${esc(data.headline)}</div>` : ""}
    </header>`;
    const photoCircle = `<div class="photo-container"><div class="photo-bg-shapes"></div>${photoBlock(data)}</div>`;
    return `<div class="${scope}">
      <div class="grid">
        <aside class="rail">${photoCircle}${railContact}${railSkills}${achievements}${education}${certs}</aside>
        <div class="body">
          ${joannaHeader}
          ${summary}
          ${experience}
          ${internships}
          ${projects}
          ${leadership}
        </div>
      </div>
    </div>`;
  }

  if (id === "enhancv-pablo") {
    const pabloHeader = `<header>
      <div class="head-text">
        <h1>${esc(data.name || "Your Name")}</h1>
        ${data.headline ? `<p class="subtitle-blue">${esc(data.headline)}</p>` : ""}
        <div class="contact-horizontal">${[data.email, data.phone, data.location, data.website, data.linkedin].filter(Boolean).map(esc).join(" &nbsp;•&nbsp; ")}</div>
      </div>
      ${photoBlock(data)}
    </header>`;
    const pabloSkills = section("Skills", `<div class="skills-table">${data.skills.filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join("")}</div>`);
    return `<div class="${scope}">${pabloHeader}${summary}${experience}${internships}${education}${pabloSkills}${projects}${certs}${leadership}${achievements}</div>`;
  }

  if (id === "enhancv-will") {
    const willHeader = `<header>
      <h1>${esc(data.name || "Your Name")}</h1>
      ${data.headline ? `<p class="headline-will">${esc(data.headline)}</p>` : ""}
    </header>`;
    
    const allJobs = [
      ...data.experience.map(j => ({ ...j, type: "Experience" })),
      ...(data.internships || []).map(j => ({ ...j, type: "Internship" }))
    ];
    
    const timelineHtml = allJobs.length
      ? `<section class="sec"><h2>Experience & Internships</h2><div class="timeline-wrapper"><div class="timeline-line"></div>` + 
        allJobs.map((job) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="row"><span class="strong">${esc(job.role)} ${job.type === "Internship" ? "(Internship)" : ""}</span><span class="meta">${esc(job.period)}</span></div>
            <div class="row"><span class="sub">${[job.company, job.location].filter(Boolean).map(esc).join(" — ")}</span></div>
            ${job.bullets.filter(Boolean).length ? `<ul>${job.bullets.filter(Boolean).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          </div>
        `).join("") + "</div></section>"
      : "";
    const willSkills = section("Skills", `<div class="skills-table">${data.skills.filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join("")}</div>`);
    return `<div class="${scope}">${willHeader}${summary}${timelineHtml}${education}${willSkills}${projects}${certs}${leadership}${achievements}</div>`;
  }

  return `<div class="${scope}">${header}${summary}${skills}${experience}${internships}${projects}${education}${certs}${leadership}${achievements}</div>`;
}

export function resumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  if (data.name) lines.push(data.name);
  if (data.headline) lines.push(data.headline);
  const contact = [data.email, data.phone, data.location, data.website, data.linkedin].filter(Boolean);
  if (contact.length) lines.push(contact.join(" | "));
  if (data.summary) lines.push("", "SUMMARY", data.summary);
  if (data.skills.filter(Boolean).length) lines.push("", "SKILLS", data.skills.filter(Boolean).join(", "));
  if (data.experience.length) {
    lines.push("", "EXPERIENCE");
    for (const job of data.experience) {
      lines.push(`${job.role}${job.company ? ` — ${job.company}` : ""}${job.location ? `, ${job.location}` : ""}${job.period ? ` (${job.period})` : ""}`);
      for (const bullet of job.bullets.filter(Boolean)) lines.push(`- ${bullet}`);
    }
  }
  if (data.internships && data.internships.length) {
    lines.push("", "INTERNSHIPS");
    for (const job of data.internships) {
      lines.push(`${job.role}${job.company ? ` — ${job.company}` : ""}${job.location ? `, ${job.location}` : ""}${job.period ? ` (${job.period})` : ""}`);
      for (const bullet of job.bullets.filter(Boolean)) lines.push(`- ${bullet}`);
    }
  }
  if (data.projects.length) {
    lines.push("", "PROJECTS");
    for (const p of data.projects) {
      lines.push(`${p.name}${p.tech ? ` (${p.tech})` : ""}`);
      if (p.description) lines.push(`- ${p.description}`);
    }
  }
  if (data.education.length) {
    lines.push("", "EDUCATION");
    for (const ed of data.education) {
      lines.push(`${ed.degree}${ed.school ? ` — ${ed.school}` : ""}${ed.period ? ` (${ed.period})` : ""}`);
      if (ed.detail) lines.push(`- ${ed.detail}`);
    }
  }
  if (data.certifications.filter(Boolean).length) {
    lines.push("", "CERTIFICATIONS", ...data.certifications.filter(Boolean).map((c) => `- ${c}`));
  }
  if (data.leadership && data.leadership.length) {
    lines.push("", "LEADERSHIP & COMMUNITY");
    for (const job of data.leadership) {
      lines.push(`${job.role}${job.company ? ` — ${job.company}` : ""}${job.location ? `, ${job.location}` : ""}${job.period ? ` (${job.period})` : ""}`);
      for (const bullet of job.bullets.filter(Boolean)) lines.push(`- ${bullet}`);
    }
  }
  if (data.keyAchievements && data.keyAchievements.filter(Boolean).length) {
    lines.push("", "KEY ACHIEVEMENTS", ...data.keyAchievements.filter(Boolean).map((a) => `- ${a}`));
  }
  return lines.join("\n");
}
