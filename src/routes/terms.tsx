import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | ResuMatch" },
      {
        name: "description",
        content:
          "The rules for using ResuMatch: acceptable use, AI output accuracy, intellectual property, liability limits and termination.",
      },
      { property: "og:title", content: "Terms of Service | ResuMatch" },
      {
        property: "og:description",
        content: "Acceptable use, AI accuracy, ownership of your content and liability limits.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <ContentPage
      title="Terms of service"
      updated="17 August 2026"
      intro="By using ResuMatch you agree to these terms. If you do not agree, please do not use the service."
    >
      <Section heading="The service">
        <p>
          ResuMatch provides AI-assisted resume analysis, rewriting and LaTeX generation. It is
          offered free of charge, as-is, and may change or be discontinued at any time.
        </p>
      </Section>
      <Section heading="Acceptable use">
        <ul className="list-disc space-y-2 pl-5">
          <li>Submit only content you own or are authorised to submit.</li>
          <li>Do not submit unlawful, hateful or malicious content, or another person's data without consent.</li>
          <li>Do not scrape, overload, reverse engineer or resell the service or its API.</li>
          <li>Do not use the output to misrepresent qualifications, employers, dates or credentials.</li>
        </ul>
      </Section>
      <Section heading="AI output">
        <p>
          Scores and rewrites are automated estimates and may be incomplete or wrong. They do not
          guarantee an interview, a job or compatibility with any particular applicant tracking
          system. You are responsible for reviewing everything before you use it.
        </p>
      </Section>
      <Section heading="Intellectual property">
        <p>
          You keep all rights to the resume content you submit and to the generated text and LaTeX
          derived from it. The ResuMatch name, interface and code remain ours.
        </p>
      </Section>
      <Section heading="Third-party services">
        <p>
          The service depends on AI, hosting and advertising providers with their own terms. We are
          not responsible for their availability or actions.
        </p>
      </Section>
      <Section heading="Liability">
        <p>
          To the maximum extent permitted by law, ResuMatch is not liable for indirect or
          consequential losses, lost opportunities, or lost data arising from your use of the
          service.
        </p>
      </Section>
      <Section heading="Termination and governing law">
        <p>
          We may restrict access for abuse or misuse. These terms are governed by the laws of the
          operator's place of establishment, without regard to conflict-of-law rules.
        </p>
      </Section>
    </ContentPage>
  );
}