"use client";

import { ContentPage, Section } from "@/components/ContentPage";

export default function CookiesPage() {
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
