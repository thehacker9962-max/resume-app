import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { FAQS, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "ResuMatch FAQ — ATS Scores, Privacy & LaTeX Export" },
      {
        name: "description",
        content:
          "Answers about ATS resume scores, whether ResuMatch is free, how your resume data is handled and how to export a LaTeX resume as PDF.",
      },
      { property: "og:title", content: "ResuMatch FAQ — ATS Scores, Privacy & LaTeX Export" },
      {
        property: "og:description",
        content: "Common questions about ATS scoring, pricing, privacy and PDF export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <ContentPage
      title="Frequently asked questions"
      intro="Everything people ask before running their first resume scan."
    >
      {FAQS.map((item) => (
        <section key={item.q} className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}
    </ContentPage>
  );
}