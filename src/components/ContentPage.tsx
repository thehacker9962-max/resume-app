import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AdSlot } from "@/components/AdSlot";

type Props = {
  title: string;
  intro: string;
  updated?: string;
  children: ReactNode;
};

export function ContentPage({ title, intro, updated, children }: Props) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base text-muted-foreground">{intro}</p>
        {updated && (
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            Last updated: {updated}
          </p>
        )}
        <AdSlot label="Top leaderboard — 728x90" className="mt-8 h-24 sm:h-28" />
        <article className="prose-resumatch mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </article>
        <AdSlot label="Footer leaderboard — 728x90" className="mt-12 h-24 sm:h-28" />
        <SiteFooter />
      </div>
    </>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground">{heading}</h2>
      {children}
    </section>
  );
}