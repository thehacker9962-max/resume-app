# FixMyResume — AI ATS resume checker & LaTeX resume builder

FixMyResume scores a resume the way an applicant tracking system plus a recruiter would, suggests
concrete fixes, rewrites the resume, and generates a compilable one-page LaTeX version with an A4
preview and PDF export.

## Features

- ATS score (0–100) with five category scores and prioritised critical/warning/minor issues
- Keyword gap analysis against a pasted job description
- Full AI resume rewrite (ATS-safe single-column plain text)
- AI LaTeX editor: instruction-driven generation, `.tex` download, A4 HTML preview, print-to-PDF
- PDF/TXT upload with client-side text extraction (`pdfjs-dist`)
- Reserved ad slots (top, in-content, footer, dual skyscrapers on desktop)
- SEO: per-route metadata, canonicals, JSON-LD (WebApplication, FAQPage, HowTo), dynamic
  `/sitemap.xml`, `robots.txt`, and policy pages

## Architecture

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Main app: tabs for ATS checker and LaTeX editor |
| `src/app/{about,how-it-works,faq,contact,privacy,terms,cookies,disclaimer}/page.tsx` | Content & policy pages |
| `src/app/sitemap.ts` | Dynamic XML sitemap generator |
| `src/lib/resume.functions.ts` | Server Actions: `analyzeResume`, `improveResume`, `generateLatex` |
| `src/lib/ai-gateway.server.ts` | Gemini access via gateway integration |
| `src/lib/resume.schemas.ts` | Zod input/output schemas and AI system prompts |
| `src/lib/latex-to-html.ts` | LaTeX → HTML renderer and A4 print CSS |
| `src/lib/site.ts` | Site constants, navigation and FAQ source of truth |
| `src/components/*` | `ResumePanel`, `AtsReport`, `LatexEditor`, `ResumePreview`, `AdSlot`, header/footer |

## Data & privacy

No database and no accounts. Resume text is sent to Gemini for a single request and held only in
React state in the browser; a refresh clears it. See `/privacy` for the published policy.

## Ads

Drop your ad network snippet inside `src/components/AdSlot.tsx` — the reserved boxes keep layout
stable so nothing shifts when ads load.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- Next.js (App Router)
- React Query
- TypeScript
- React
- Tailwind CSS
