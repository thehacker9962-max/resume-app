"use client";

import { ContentPage, Section } from "@/components/ContentPage";

export default function DisclaimerPage() {
  return (
    <ContentPage
      title="Disclaimer"
      updated="17 August 2026"
      intro="Read this before relying on any score or rewrite produced by ResuMatch."
    >
      <Section heading="Estimates, not verdicts">
        <p>
          Real applicant tracking systems are configured differently by every employer. Our score
          approximates how a well-configured parser and an experienced recruiter would read your
          resume; it cannot replicate a specific employer's setup.
        </p>
      </Section>
      <Section heading="No guarantee of outcomes">
        <p>
          Using ResuMatch does not guarantee interviews, offers or that your resume will pass any
          screening step. Hiring decisions depend on many factors outside a document.
        </p>
      </Section>
      <Section heading="Not professional advice">
        <p>
          Content on this site is informational and is not career counselling, legal, immigration or
          employment advice.
        </p>
      </Section>
      <Section heading="Accuracy of AI output">
        <p>
          AI can produce phrasing that overstates your experience. Verify every claim, date and
          metric before submitting your resume anywhere.
        </p>
      </Section>
      <Section heading="No affiliation">
        <p>
          ResuMatch is independent and unaffiliated with Workday, Greenhouse, Taleo, iCIMS, Lever,
          LinkedIn, Overleaf or Google. Trademarks belong to their owners.
        </p>
      </Section>
    </ContentPage>
  );
}
