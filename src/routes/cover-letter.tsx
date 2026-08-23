import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileText, Sparkles, Copy, Download, Loader2, RefreshCw, Lock, ArrowRight, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdSlot } from "@/components/AdSlot";
import { useAuth } from "@/hooks/use-auth";
import { generateCoverLetter } from "@/lib/pro.functions";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [
      { title: `AI Cover Letter Generator — Tailor Letters Instantly | ${SITE_NAME}` },
      {
        name: "description",
        content: "Generate highly customized, professional cover letters that match your resume and job description using Gemini AI. Choose your tone and stand out.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cover-letter` }],
  }),
  component: CoverLetterPage,
});

type Tone = "professional" | "confident" | "creative" | "academic" | "warm";

function CoverLetterPage() {
  const {
    user,
    isAuthenticated,
    subscriptionTier,
    upgradeToTier,
    canGenerateCoverLetter,
    registerCoverLetter,
    getRemainingCoverLetters
  } = useAuth();
  const navigate = useNavigate();
  
  const [resumeData, setResumeData] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const generateFn = useServerFn(generateCoverLetter);
  const isPremium = subscriptionTier === "pro" || subscriptionTier === "elite";

  const generate = useMutation({
    mutationFn: () => generateFn({ data: { resumeData, jobDescription, tone } }),
    onSuccess: () => {
      registerCoverLetter();
      toast.success("Cover letter generated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate cover letter.");
    },
  });

  const handleGenerate = () => {
    if (!canGenerateCoverLetter()) {
      setIsUpgradeModalOpen(true);
      return;
    }
    generate.mutate();
  };

  const handleCopy = () => {
    if (!generate.data) return;
    const fullText = `Subject: ${generate.data.subjectLine}\n\n${generate.data.letterBody}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!generate.data) return;
    const fullText = `Subject: ${generate.data.subjectLine}\n\n${generate.data.letterBody}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cover_Letter_${tone}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const loadSampleData = () => {
    setResumeData(
      `Name: Jane Doe\nSkills: React, Node.js, TypeScript, PostgreSQL, AWS\nExperience: 3 years as Fullstack Engineer at Techcorp. Led checkout rewrite, reducing bounce rates by 12%. Automated deployments on AWS, reducing release cycles from days to hours.\nEducation: B.S. in Computer Science`
    );
    setJobDescription(
      `We are looking for a Senior Full Stack Engineer proficient in React, Node.js, and TypeScript. Experience with AWS cloud infrastructure and optimizing user experiences is highly desired.`
    );
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        
        {/* Header */}
        <header className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 fill-primary" /> Pro Feature
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            AI Cover Letter Generator
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Instantly tailor your cover letter to any job description. Select your preferred tone and stand out to recruiters.
          </p>
        </header>

        {/* Access Gate */}
        {!isPremium ? (
          <div className="panel mt-10 p-8 text-center max-w-2xl mx-auto border-2 border-primary/30 relative overflow-hidden bg-card">
            <div className="absolute inset-0 bg-surface-glow pointer-events-none opacity-20" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                <Lock className="size-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Unlock Pro Cover Letters</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Creating customized cover letters is a premium feature. Upgrade to Pro or Elite to tailor letters to your target roles.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
                {isAuthenticated ? (
                  <Button className="w-full font-semibold bg-gradient-brand shadow-md text-black" size="lg" onClick={() => upgradeToTier("pro")}>
                    <Zap className="size-4 mr-2 fill-black" /> Upgrade to Pro
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={() => navigate({ to: "/auth", search: { redirect: "/cover-letter" } })}>
                    Sign In to Upgrade
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/pricing" })}>
                  View Pricing Plans <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>

              <div className="mt-8 border-t border-border w-full pt-6 grid grid-cols-2 gap-4 text-left max-w-md text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>5 Tailored Tones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>AI Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Copy & Download Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-primary shrink-0" />
                  <span>Unlimited generations</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            
            {/* Input Form Column */}
            <div className="md:col-span-5 space-y-6">
              <div className="panel p-6 bg-card border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-semibold text-sm">Input Details</h3>
                  <Button variant="ghost" size="sm" onClick={loadSampleData} className="text-xs text-primary hover:text-primary/80">
                    Load Sample Data
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="resume" className="text-xs">Your Resume details</Label>
                  <Textarea
                    id="resume"
                    value={resumeData}
                    onChange={(e) => setResumeData(e.target.value)}
                    placeholder="Paste your resume highlights, key skills, and target experience here..."
                    className="min-h-40 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job" className="text-xs">Target Job Description</Label>
                  <Textarea
                    id="job"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description to match skills and highlights..."
                    className="min-h-40 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Select Tone</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["professional", "confident", "creative", "academic", "warm"] as Tone[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={cn(
                          "rounded-md border p-2 text-[10px] font-semibold capitalize transition-all cursor-pointer",
                          tone === t
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/70"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generate.isPending || !resumeData.trim() || !jobDescription.trim()}
                  className="w-full font-semibold shadow-md shadow-primary/10"
                >
                  {generate.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 size-4" />
                      Crafting cover letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Output Display Column */}
            <div className="md:col-span-7 space-y-6">
              {generate.data ? (
                <div className="panel p-6 bg-card border border-border flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="size-4 text-primary" /> Generated Output
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="size-8 p-0" title="Copy">
                        <Copy className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload} className="size-8 p-0" title="Download">
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex-1">
                    <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 text-xs font-mono text-foreground space-y-1">
                      <span className="text-muted-foreground">Subject:</span> {generate.data.subjectLine}
                    </div>

                    <article className="mt-5 prose prose-sm text-sm text-foreground/80 font-sans leading-relaxed whitespace-pre-line">
                      {generate.data.letterBody}
                    </article>
                  </div>

                  {generate.data.tailoringRecommendations && generate.data.tailoringRecommendations.length > 0 && (
                    <div className="mt-6 border-t border-border/80 pt-5 space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Tailoring recommendations:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                        {generate.data.tailoringRecommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="panel p-8 bg-card border border-border border-dashed h-full min-h-[500px] flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-secondary rounded-full text-muted-foreground mb-4">
                    <FileText className="size-6" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">No cover letter generated yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Fill in your resume details and the target job description on the left, then click Generate to construct your customized cover letter.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
      <SiteFooter />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="Upgrade to Pro to unlock the AI Cover Letter Generator."
      />
    </>
  );
}
