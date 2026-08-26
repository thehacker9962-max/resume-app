"use client";

import { ContentPage } from "@/components/ContentPage";
import { FAQS } from "@/lib/site";

export default function FAQPage() {
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
