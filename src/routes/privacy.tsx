import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section } from "@/components/ContentPage";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | ResuMatch" },
      {
        name: "description",
        content:
          "How ResuMatch handles resume text, AI processing, cookies and advertising data — including your rights under GDPR and CCPA.",
      },
      { property: "og:title", content: "Privacy Policy | ResuMatch" },
      {
        property: "og:description",
        content: "What we process, what we never store, and how to exercise your data rights.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <ContentPage
      title="Privacy policy"
      updated="17 August 2026"
      intro="ResuMatch is built to work without accounts and without a database. This policy explains exactly what is processed."
    >
      <Section heading="Data we process">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Resume and job description text</strong> — sent to
            our AI provider to produce your score, rewrite or LaTeX document. It is processed in
            memory for that single request and is not written to any database by us.
          </li>
          <li>
            <strong className="text-foreground">Technical data</strong> — IP address, user agent and
            timestamps recorded by our hosting provider for security, abuse prevention and
            reliability.
          </li>
          <li>
            <strong className="text-foreground">Advertising data</strong> — if advertising is served,
            our ad partners may set cookies or similar identifiers as described below.
          </li>
        </ul>
      </Section>
      <Section heading="What we do not do">
        <p>
          We do not create accounts, sell personal data, build advertising profiles from your resume
          content, or use your resume to train our own models.
        </p>
      </Section>
      <Section heading="AI processing">
        <p>
          Analysis is performed by Google Gemini accessed through a server-side gateway. Your text is
          transmitted over TLS. Providers may retain request data briefly for abuse monitoring under
          their own terms. Do not paste information you are not comfortable sharing with a
          third-party AI service.
        </p>
      </Section>
      <Section heading="Legal bases (GDPR)">
        <p>
          We rely on legitimate interests for running and securing the service, consent for
          non-essential cookies and personalised advertising, and performance of a contract for
          delivering the analysis you request.
        </p>
      </Section>
      <Section heading="Retention">
        <p>
          Resume content: not retained. Server logs: typically up to 30 days. Support emails: kept
          only as long as needed to resolve your enquiry.
        </p>
      </Section>
      <Section heading="Your rights">
        <p>
          Depending on where you live you may request access, correction, deletion, portability or
          restriction of your data, object to processing, and opt out of the “sale” or “sharing” of
          personal information. Email{" "}
          <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          and we will respond within the period required by law.
        </p>
      </Section>
      <Section heading="Children">
        <p>The service is not directed at children under 16 and we do not knowingly collect their data.</p>
      </Section>
      <Section heading="Changes">
        <p>
          Material changes will be reflected by updating the date at the top of this page. Continued
          use after an update means you accept the revised policy.
        </p>
      </Section>
    </ContentPage>
  );
}