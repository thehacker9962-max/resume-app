export const SITE_NAME = "FixMyResume";
export const SITE_URL = "https://project--184a66fd-f1ab-460f-911c-207bba405280.lovable.app";
export const CONTACT_EMAIL = "hello@fixmyresume.com";

export const NAV_LINKS = [
  { to: "/", label: "Resume builder" },
  { to: "/ats-checker", label: "ATS checker & LaTeX builder" },
  { to: "/cover-letter", label: "AI Cover Letter" },
  { to: "/interview-prep", label: "Interview Prep" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of service" },
  { to: "/cookies", label: "Cookie policy" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

export const FAQS = [
  {
    q: "What is an ATS resume score?",
    a: "An ATS (Applicant Tracking System) score estimates how well an applicant tracking system such as Workday, Greenhouse or Taleo can parse your resume and how closely it matches a job description. ResuMatch scores keyword match, formatting and parsability, impact and metrics, skills coverage, and clarity.",
  },
  {
    q: "Is ResuMatch free to use?",
    a: "Yes. You can check your resume score, get AI fixes and generate a LaTeX resume for free. The site is supported by advertising.",
  },
  {
    q: "Do you store my resume?",
    a: "No. Your resume text is sent to the AI model for a single analysis request and is never written to a database. Everything else stays in your browser and disappears when you refresh.",
  },
  {
    q: "Which AI model powers the analysis?",
    a: "ResuMatch uses Google Gemini through a secure server-side gateway, so no API keys are exposed in your browser.",
  },
  {
    q: "Can I download my resume as a PDF?",
    a: "Yes. After generating LaTeX, the A4 live preview can be downloaded directly as a PDF from your browser, or you can download the .tex file and compile it in Overleaf.",
  },
  {
    q: "How do I make my resume ATS-friendly?",
    a: "Use a single-column layout, standard section headings, plain text instead of tables or images, keywords taken from the job posting, and quantified achievement bullets that start with a strong verb.",
  },
] as const;