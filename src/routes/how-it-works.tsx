import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How to Check & Improve Your ATS Resume Score | FixMyResume" },
      {
        name: "description",
        content:
          "Step-by-step guide to checking your resume ATS score, fixing keyword gaps and exporting an ATS-friendly LaTeX resume as a PDF.",
      },
      {
        name: "keywords",
        content:
          "how to improve ats score, resume keyword optimization, ats compliance guide, fix cv gaps, guide, fixmyresume",
      },
      { property: "og:title", content: "How to Check & Improve Your ATS Resume Score" },
      {
        property: "og:description",
        content:
          "Paste your resume, add the job description, score it, apply the AI fixes and export a clean PDF.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/how-it-works` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to check and improve your resume ATS score",
          step: [
            { "@type": "HowToStep", name: "Add your resume", text: "Upload a PDF or paste your resume text." },
            { "@type": "HowToStep", name: "Add the job description", text: "Paste the posting you are targeting so keywords can be compared." },
            { "@type": "HowToStep", name: "Run the ATS scan", text: "Get an overall score plus category scores and prioritised fixes." },
            { "@type": "HowToStep", name: "Apply the AI rewrite", text: "Generate an ATS-optimised version of your resume." },
            { "@type": "HowToStep", name: "Export", text: "Build the LaTeX version and download the .tex file or save the A4 preview as PDF." },
          ],
        }),
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <ContentPage
      title="How to check and improve your ATS resume score"
      intro="Five steps, about five minutes, from raw resume to an ATS-ready PDF."
    >
      <Section heading="1. Add your resume">
        <p>
          Upload a PDF or paste plain text. Text is extracted in your browser, so large files stay
          fast. Keep contact details at the top and avoid text inside images — parsers cannot read
          them.
        </p>
      </Section>
      <Section heading="2. Paste the job description">
        <p>
          Keyword matching is only meaningful against a real posting. Adding the job description
          lets ResuMatch list the exact skills, tools and titles you are missing.
        </p>
      </Section>
      <Section heading="3. Run the ATS scan">
        <p>
          You get an overall score and five category scores: Keyword Match, Formatting &amp;
          Parsability, Impact &amp; Metrics, Skills Coverage, and Clarity &amp; Brevity. Issues are
          ranked critical, warning and minor so you fix the expensive problems first.
        </p>
      </Section>
      <Section heading="4. Apply the AI rewrite">
        <p>
          The optimiser returns a single-column, standard-heading resume with quantified bullets. It
          never invents employers, degrees or dates — review every line before sending it out.
        </p>
      </Section>
      <Section heading="5. Export a clean PDF">
        <p>
          Switch to the LaTeX editor to generate a complete document, check the A4 live preview, then
          download the .tex file or print the preview to PDF. Both use the same serif typography, so
          what you see is what recruiters get.
        </p>
      </Section>
      <Section heading="ATS formatting rules worth memorising">
        <ul className="list-disc space-y-2 pl-5">
          <li>One column, no tables, text boxes, headers/footers or icons.</li>
          <li>Standard headings: Summary, Skills, Experience, Projects, Education.</li>
          <li>Month and year date ranges written consistently.</li>
          <li>Spell out an acronym once alongside its expansion (e.g. “CI/CD (continuous delivery)”).</li>
          <li>Save as PDF unless the posting explicitly asks for .docx.</li>
        </ul>
      </Section>
    </ContentPage>
  );
}