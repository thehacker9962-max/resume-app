import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ResuMatch — Support, Feedback & Advertising" },
      {
        name: "description",
        content:
          "Get in touch with the ResuMatch team about support, bug reports, privacy requests, advertising or partnership enquiries.",
      },
      { property: "og:title", content: "Contact ResuMatch" },
      {
        property: "og:description",
        content: "Support, privacy requests, advertising and partnership enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <ContentPage
      title="Contact us"
      intro="Questions, bugs, privacy requests or advertising — email is the fastest route."
    >
      <Section heading="Email">
        <p>
          <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>We usually reply within two business days.</p>
      </Section>
      <Section heading="What to include">
        <ul className="list-disc space-y-2 pl-5">
          <li>Bug reports: what you did, what you expected, and the browser you used.</li>
          <li>Privacy requests: the request type (access, deletion, objection).</li>
          <li>Advertising: placements you are interested in and expected volume.</li>
        </ul>
      </Section>
      <Section heading="Please do not send">
        <p>
          Do not email sensitive personal data such as identity documents, government ID numbers or
          financial details. We do not need them to help you.
        </p>
      </Section>
    </ContentPage>
  );
}