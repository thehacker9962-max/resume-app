import { z } from "zod";

export const AnalyzeInput = z.object({
  resume: z.string().min(50, "Please provide a longer resume."),
  jobDescription: z.string().default(""),
});

export const IssueSchema = z.object({
  title: z.string(),
  severity: z.enum(["critical", "warning", "minor"]),
  detail: z.string(),
  fix: z.string(),
});

export const AnalysisSchema = z.object({
  score: z.number(),
  verdict: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string(),
    }),
  ),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  issues: z.array(IssueSchema),
  rewrittenSummary: z.string(),
  improvedBullets: z.array(z.object({ before: z.string(), after: z.string() })),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

export const ImproveInput = z.object({
  resume: z.string().min(50),
  jobDescription: z.string().default(""),
});

export const LatexInput = z.object({
  instruction: z.string().min(3),
  currentCode: z.string().default(""),
  resume: z.string().default(""),
});

export const ANALYZE_SYSTEM = `You are a senior technical recruiter and ATS (Applicant Tracking System) expert.
Evaluate the resume the way Workday, Greenhouse and Taleo parsers plus a human recruiter would.
Score 0-100 overall. Category scores are also 0-100 and must cover: Keyword Match, Formatting & Parsability, Impact & Metrics, Skills Coverage, Clarity & Brevity.
List at most 8 issues, at most 12 keywords per keyword list, and at most 5 improved bullets.
Rewritten bullets must start with a strong verb and include a metric when plausible. Be concrete, never generic.`;

export const IMPROVE_SYSTEM = `You are an expert resume writer. Rewrite the resume so it is ATS-friendly:
plain single-column text, standard section headings (SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION),
quantified achievement bullets starting with strong verbs, and keywords from the target role woven in naturally.
Never invent employers, degrees or dates. Return only the rewritten resume as plain text.`;

export const LATEX_SYSTEM = `You are a LaTeX expert specialising in clean, ATS-parsable one-page resumes.
Always return a COMPLETE compilable LaTeX document using only standard packages
(article class, geometry, enumitem, titlesec, hyperref) - no exotic packages, no images, no multi-column layouts.
Return ONLY raw LaTeX code with no markdown fences and no commentary.`;