import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy | ResuMatch" },
      {
        name: "description",
        content:
          "Which cookies ResuMatch and its advertising partners use, why they are used, and how to control or block them in your browser.",
      },
      { property: "og:title", content: "Cookie Policy | ResuMatch" },
      {
        property: "og:description",
        content: "Essential vs advertising cookies and how to opt out.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cookies` }],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <ContentPage
      title="Cookie policy"
      updated="17 August 2026"
      intro="ResuMatch works without login, so we use very few cookies of our own."
    >
      <Section heading="Essential">
        <p>
          Strictly necessary storage keeps the interface working — for example remembering the tab
          you are on during a session. These cannot be switched off without breaking the site.
        </p>
      </Section>
      <Section heading="Advertising">
        <p>
          Ad slots on this site may be filled by third-party networks such as Google AdSense. Those
          partners can set cookies or device identifiers to limit repetition, measure performance and
          — where you have consented — personalise ads. We do not share your resume content with
          them.
        </p>
      </Section>
      <Section heading="Analytics">
        <p>
          Aggregate, privacy-respecting traffic measurement may be used to understand which pages are
          useful. It is never linked to your resume text.
        </p>
      </Section>
      <Section heading="Your controls">
        <ul className="list-disc space-y-2 pl-5">
          <li>Block or delete cookies in your browser settings at any time.</li>
          <li>
            Manage Google ad personalisation at{" "}
            <a className="text-primary underline" href="https://adssettings.google.com" rel="nofollow noopener">
              adssettings.google.com
            </a>
            .
          </li>
          <li>EU/UK visitors can withdraw advertising consent through the consent prompt.</li>
        </ul>
      </Section>
    </ContentPage>
  );
}