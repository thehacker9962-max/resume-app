import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ResuMatch — Free AI ATS Resume Checker" },
      {
        name: "description",
        content:
          "ResuMatch is a free AI resume tool that scores your CV like an ATS, rewrites weak bullets and builds a clean LaTeX resume. Learn who we are and how we work.",
      },
      { property: "og:title", content: "About ResuMatch — Free AI ATS Resume Checker" },
      {
        property: "og:description",
        content: "Who builds ResuMatch, how the ATS scoring works and what we do with your data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: About,
});

function About() {
  return (
    <ContentPage
      title="About ResuMatch"
      intro="ResuMatch helps job seekers get past automated resume screening and in front of a human recruiter."
    >
      <Section heading="Why we built it">
        <p>
          Most applications are filtered by an applicant tracking system before a recruiter opens
          them. Formatting quirks, missing keywords and vague bullet points quietly sink strong
          candidates. ResuMatch turns that invisible filter into a concrete checklist you can act on
          in minutes.
        </p>
      </Section>
      <Section heading="What the tool does">
        <ul className="list-disc space-y-2 pl-5">
          <li>Scores your resume 0–100 overall and across five recruiter-relevant categories.</li>
          <li>Compares your resume against a specific job description and lists missing keywords.</li>
          <li>Rewrites bullets into quantified achievement statements.</li>
          <li>Generates a complete, compilable LaTeX resume with an A4 preview and PDF export.</li>
        </ul>
      </Section>
      <Section heading="How it is powered">
        <p>
          Analysis runs on Google Gemini through a secure server-side gateway. No API keys are
          exposed in your browser, and there is no database — nothing about your resume is retained
          after the response is returned.
        </p>
      </Section>
      <Section heading="Independence">
        <p>
          ResuMatch is an independent tool and is not affiliated with, endorsed by or certified by
          Workday, Greenhouse, Taleo, LinkedIn, Overleaf or Google. Scores are estimates designed to
          guide edits, not guarantees of an interview.
        </p>
      </Section>
    </ContentPage>
  );
}