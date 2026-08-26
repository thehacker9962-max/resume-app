"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ScanLine, FileCode2, Gauge, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResumePanel } from "@/components/ResumePanel";
import { AtsReport } from "@/components/AtsReport";
import { LatexEditor } from "@/components/LatexEditor";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FAQS, SITE_NAME } from "@/lib/site";
import { analyzeResume, improveResume, generateLatex } from "@/lib/resume.functions";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useNavigate } from "@/hooks/use-navigate";

export default function AtsCheckerPage() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [improved, setImproved] = useState("");
  const [latex, setLatex] = useState("");
  const [tab, setTab] = useState("checker");
  const [adGateActive, setAdGateActive] = useState(false);
  const [adCountdown, setAdCountdown] = useState(6);
  const [reportUnlocked, setReportUnlocked] = useState(false);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const {
    isAuthenticated,
    canPerformAtsScan,
    registerAtsScan,
    canGenerateLatex,
    registerLatexGen
  } = useAuth();
  const navigate = useNavigate();

  const startAnalysis = () => {
    if (resume.trim().length < 50) return;
    
    if (!isAuthenticated) {
      toast.error("Please sign in or register to scan your resume.", {
        action: {
          label: "Sign In",
          onClick: () => navigate({ to: "/auth", search: { redirect: "/ats-checker" } })
        }
      });
      return;
    }

    if (!canPerformAtsScan()) {
      setUpgradeReason("You have used your 1 free ATS Score scan. Upgrade to Pro for unlimited ATS checks.");
      setIsUpgradeModalOpen(true);
      return;
    }

    registerAtsScan();
    setAdGateActive(true);
    setAdCountdown(6);
    setReportUnlocked(false);
    analysis.mutate();

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const analysis = useMutation({
    mutationFn: () => analyzeResume({ resume, jobDescription }),
    onError: (error: Error) => toast.error(error.message || "Analysis failed. Please try again."),
  });

  const improve = useMutation({
    mutationFn: () => improveResume({ resume, jobDescription }),
    onSuccess: (result) => {
      setImproved(result.text);
      toast.success("Optimised resume ready");
    },
    onError: (error: Error) => toast.error(error.message || "Could not rewrite the resume."),
  });

  const latexGen = useMutation({
    mutationFn: (instruction: string) =>
      generateLatex({
        instruction,
        currentCode: latex,
        resume: improved || resume,
      }),
    onSuccess: (result) => {
      setLatex(result.code);
      registerLatexGen();
      toast.success("LaTeX updated");
    },
    onError: (error: Error) => toast.error(error.message || "Could not generate LaTeX."),
  });

  const handleGenerateLatex = (instruction: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in or register to use the LaTeX builder.", {
        action: {
          label: "Sign In",
          onClick: () => navigate({ to: "/auth", search: { redirect: "/ats-checker" } })
        }
      });
      return;
    }
    if (!canGenerateLatex()) {
      setUpgradeReason("You have used your 1 free LaTeX document generation. Upgrade to Pro for unlimited LaTeX conversions.");
      setIsUpgradeModalOpen(true);
      return;
    }
    latexGen.mutate(instruction);
  };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1600px] justify-center gap-4 px-4 lg:gap-6 py-4 sm:px-6 lg:py-6">
        <AdSlot
          label="Left skyscraper — 160x600"
          className="sticky top-8 hidden h-[600px] w-32 shrink-0 lg:flex xl:w-40"
        />

        <main className="w-full max-w-5xl">
          <header className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
              <Gauge className="size-3.5 text-primary" /> Powered by Gemini via Lovable AI
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Free AI ATS resume checker
              <br />
              <span className="text-gradient-brand">and LaTeX resume builder</span>
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Score your resume like a real applicant tracking system, see the exact keywords you are
              missing, apply AI fixes and export a polished one-page LaTeX resume — no signup, nothing
              stored.
            </p>
          </header>

          <AdSlot label="Top leaderboard — 970x90 / 728x90" className="mt-4 h-24 sm:h-28" />

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="mx-auto">
              <TabsTrigger value="checker">
                <ScanLine className="size-4" /> ATS checker
              </TabsTrigger>
              <TabsTrigger value="latex">
                <FileCode2 className="size-4" /> LaTeX editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checker" className="mt-8 space-y-6">
              <ResumePanel
                resume={resume}
                onResumeChange={setResume}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onAnalyze={startAnalysis}
                isAnalyzing={analysis.isPending}
              />
              {analysis.data && reportUnlocked && (
                <AtsReport
                  analysis={analysis.data}
                  onImprove={() => improve.mutate()}
                  isImproving={improve.isPending}
                  improved={improved}
                  onSendToLatex={() => {
                    setTab("latex");
                    handleGenerateLatex(
                      "Generate a clean one-page ATS-friendly LaTeX resume from the resume content",
                    );
                  }}
                />
              )}
              <AdSlot label="In-content rectangle — 336x280" className="h-40 sm:h-48" />
            </TabsContent>

            <TabsContent value="latex" className="mt-8">
              <AdSlot label="In-content banner — 728x90" className="mb-6 h-24 sm:h-28" />
              <LatexEditor
                code={latex}
                onCodeChange={setLatex}
                onGenerate={handleGenerateLatex}
                isGenerating={latexGen.isPending}
              />
            </TabsContent>
          </Tabs>

          <AdSlot label="Footer leaderboard — 728x90" className="mt-12 h-24 sm:h-28" />

          <section className="mt-16 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Why resumes fail applicant tracking systems
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Recruiters rarely see a resume that a parser cannot read. Multi-column layouts, tables,
                icons, text inside images and creative section names break extraction, while missing role
                keywords push you below the ranking cut-off. ResuMatch checks both sides of that problem:
                machine parsability and human relevance. You get an overall ATS score, five category
                scores — keyword match, formatting and parsability, impact and metrics, skills coverage,
                clarity and brevity — and a prioritised list of fixes.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <article>
                <h3 className="font-display text-base font-semibold">Keyword gap analysis</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Paste any job description to see matched and missing keywords, so you tailor each
                  application instead of guessing.
                </p>
              </article>
              <article>
                <h3 className="font-display text-base font-semibold">AI resume rewrite</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Turn duty-based lines into quantified achievement bullets with strong verbs — without
                  inventing employers, dates or degrees.
                </p>
              </article>
              <article>
                <h3 className="font-display text-base font-semibold">LaTeX resume &amp; PDF</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate a compilable one-page LaTeX document, preview it at A4 size and download the
                  .tex file or save it as PDF.
                </p>
              </article>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Frequently asked questions</h2>
              <dl className="mt-4 space-y-5">
                {FAQS.slice(0, 4).map((item) => (
                  <div key={item.q}>
                    <dt className="text-sm font-semibold">{item.q}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <SiteFooter />
        </main>

        <AdSlot
          label="Right skyscraper — 160x600"
          className="sticky top-8 hidden h-[600px] w-32 shrink-0 lg:flex xl:w-40"
        />
      </div>

      {/* Ad Interstitial Gate */}
      {adGateActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-2xl text-center space-y-4 m-4">
            <h3 className="font-display text-lg font-bold">Running Resume ATS Scan...</h3>
            <div className="flex justify-center py-1">
              <Loader2 className="size-7 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              {adCountdown > 0 
                ? `Analyzing resume layout and keyword matches. Results ready in ${adCountdown}s...` 
                : analysis.isPending 
                  ? "Finalizing your report details..." 
                  : "ATS Match score ready!"}
            </p>

            {/* In-modal Ad Unit */}
            <div className="border border-border rounded-lg bg-secondary/30 p-2 min-h-48 flex flex-col items-center justify-center">
              <AdSlot label="Interstitial Ad — 300x250" className="h-[250px] w-[300px]" />
            </div>

            <Button 
              onClick={() => {
                setAdGateActive(false);
                setReportUnlocked(true);
                toast.success("ATS score unlocked!");
              }}
              disabled={adCountdown > 0 || analysis.isPending}
              className="w-full mt-2"
            >
              {adCountdown > 0 
                ? `Wait ${adCountdown}s` 
                : analysis.isPending 
                  ? "Loading Report..." 
                  : "Reveal ATS Score & Report"}
            </Button>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason={upgradeReason}
      />
    </>
  );
}
