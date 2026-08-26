"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Wand2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BuilderForm } from "@/components/BuilderForm";
import { TemplatePicker } from "@/components/TemplatePicker";
import { ResumeSheet } from "@/components/ResumeSheet";
import { EMPTY_RESUME, type ResumeData } from "@/lib/builder.schemas";
import type { TemplateId } from "@/lib/resume-templates";
import { buildResume, polishResume, parseResumeTextWithAi } from "@/lib/builder.functions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { extractPdfText } from "@/lib/pdf-parser";
import { useAuth } from "@/hooks/use-auth";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useNavigate } from "@/hooks/use-navigate";

export default function BuilderPage() {
  const {
    isAuthenticated,
    canUploadOrEdit,
    registerUploadOrEdit,
    canBuildResume,
    registerBuildResume,
    canPolishResume,
    registerPolishResume
  } = useAuth();
  const navigate = useNavigate();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const [brief, setBrief] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [template, setTemplate] = useState<TemplateId>("modern");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("preview");
  const [parsingDirect, setParsingDirect] = useState(false);
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleDirectUpload(file: File | undefined) {
    if (!file) return;
    if (!canUploadOrEdit()) {
      toast.error("Please sign up to upload more resumes or edit layouts.", {
        action: {
          label: "Sign Up",
          onClick: () => navigate({ to: "/auth", search: { redirect: "/" } })
        }
      });
      return;
    }
    setParsingDirect(true);
    const toastId = toast.loading(`Uploading and parsing ${file.name}...`);
    try {
      const text =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
          ? await extractPdfText(file)
          : await file.text();

      if (!text || text.trim().length === 0) {
        throw new Error("No selectable text found in the PDF. Make sure it is not scanned/an image.");
      }

      const result = await parseResumeTextWithAi({ text });
      if (result.error) {
        throw new Error(result.error);
      }
      setData({ ...result, photo: data.photo });
      registerUploadOrEdit();
      toast.success("Resume details extracted successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not extract details. Make sure the PDF has selectable text.", { id: toastId });
    } finally {
      setParsingDirect(false);
    }
  }


  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!canUploadOrEdit()) {
      toast.error("Please sign up to upload more resumes.", {
        action: {
          label: "Sign Up",
          onClick: () => navigate({ to: "/auth", search: { redirect: "/" } })
        }
      });
      return;
    }
    setParsing(true);
    try {
      const text =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
          ? await extractPdfText(file)
          : await file.text();
      if (!text) throw new Error("No selectable text found.");
      setBrief(text);
      registerUploadOrEdit();
      toast.success(`Loaded ${file.name} into target description!`);
    } catch {
      toast.error("Could not read that file. Try pasting the text instead.");
    } finally {
      setParsing(false);
    }
  }

  const build = useMutation({
    mutationFn: () => buildResume({ brief, targetRole }),
    onSuccess: (result) => {
      setData({ ...result, photo: data.photo });
      registerBuildResume();
      toast.success("Resume drafted — edit anything below");
    },
    onError: (error: Error) => toast.error(error.message || "Could not build the resume."),
  });

  const polish = useMutation({
    mutationFn: () => polishResume({ data, targetRole }),
    onSuccess: (result) => {
      setData({ ...result, photo: data.photo });
      registerPolishResume();
      toast.success("Resume polished");
    },
    onError: (error: Error) => toast.error(error.message || "Could not polish the resume."),
  });

  function handleDataChange(newData: ResumeData) {
    if (!isAuthenticated && !canUploadOrEdit()) {
      toast.error("Please sign up to continue editing and saving your layout.", {
        action: {
          label: "Sign Up",
          onClick: () => navigate({ to: "/auth", search: { redirect: "/" } })
        }
      });
      return;
    }
    setData(newData);
    if (!isAuthenticated) {
      registerUploadOrEdit();
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1600px] justify-center gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:py-6">
        <AdSlot
          label="Left skyscraper — 160x600"
          className="sticky top-8 hidden h-[600px] w-32 shrink-0 lg:flex xl:w-40"
        />

        <main className="w-full max-w-5xl">
          <header className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
              <Wand2 className="size-3.5 text-primary" /> No LaTeX needed
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Free AI resume builder
              <br />
              <span className="text-gradient-brand">with ATS-ready templates</span>
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Describe your background in plain words, let AI structure and write it, then pick a
              professional template and download a clean A4 PDF — free, no signup.
            </p>
          </header>

          <AdSlot label="Top leaderboard — 970x90 / 728x90" className="mt-4 h-24 sm:h-28" />

          {/* Quick PDF Import Bar */}
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleDirectUpload(file);
            }}
            className={cn(
              "mt-6 panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 border",
              isDragging 
                ? "bg-primary/10 border-primary border-dashed scale-[1.01] shadow-md shadow-primary/5" 
                : "bg-primary/5 border-primary/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0 transition-colors",
                isDragging ? "bg-primary/25 text-primary" : "bg-primary/10 text-primary"
              )}>
                <Upload className="size-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Autofill sections from PDF</h3>
                <p className="text-xs text-muted-foreground">
                  {isDragging ? "Drop your PDF here!" : "Drag & drop or upload any existing PDF resume to automatically populate the details below."}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex gap-2">
              <input
                ref={directFileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(event) => handleDirectUpload(event.target.files?.[0])}
              />
              <Button 
                onClick={() => directFileInputRef.current?.click()}
                disabled={parsingDirect}
                className="w-full sm:w-auto"
                variant="default"
              >
                {parsingDirect ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-4" />
                    Extracting details...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Upload PDF / Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex justify-center xl:hidden mt-6 mb-2">
            <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1">
              <button
                type="button"
                onClick={() => setView("preview")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
                  view === "preview"
                     ? "bg-background text-foreground shadow-sm"
                     : "text-muted-foreground hover:text-foreground"
                )}
              >
                Live preview
              </button>
              <button
                type="button"
                onClick={() => setView("edit")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
                  view === "edit"
                     ? "bg-background text-foreground shadow-sm"
                     : "text-muted-foreground hover:text-foreground"
                )}
              >
                Edit details
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className={cn("xl:sticky xl:top-8 xl:self-start", view === "preview" ? "block" : "hidden xl:block")}>
              <ResumeSheet data={data} template={template} />
            </div>
            <div className={cn(view === "edit" ? "block" : "hidden xl:block")}>
              <BuilderForm data={data} onChange={handleDataChange} />
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Choose a template</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every template is single-column-safe, uses standard headings and parses cleanly in
              Workday, Greenhouse and Taleo.
            </p>
            <div className="mt-3">
              <TemplatePicker value={template} onChange={setTemplate} />
            </div>
          </section>

          <section className="panel mt-8 space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Start with AI</h2>
                <p className="text-sm text-muted-foreground">
                  Describe your background, paste notes, or upload your old resume to begin.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
              >
                {parsing ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
                {parsing ? "Reading PDF…" : "Upload old resume"}
              </Button>
            </div>
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs text-muted-foreground">Target role (optional)</Label>
              <Input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="e.g. Senior Backend Engineer at a fintech"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Your background</Label>
              <Textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                className="min-h-40"
                placeholder="4 years as a frontend dev at Zeta, React + TypeScript, led the checkout rewrite, B.Tech CSE from VIT 2020, built an open-source charting library…"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in or register to use AI drafting features.", {
                      action: {
                        label: "Sign In",
                        onClick: () => navigate({ to: "/auth", search: { redirect: "/" } })
                      }
                    });
                    return;
                  }
                  if (!canBuildResume()) {
                    setUpgradeReason("You have used your 2 free AI Resume Drafts. Upgrade to Pro for unlimited drafts.");
                    setIsUpgradeModalOpen(true);
                    return;
                  }
                  build.mutate();
                }} 
                disabled={build.isPending || brief.trim().length < 20}
              >
                {build.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {build.isPending ? "Writing your resume…" : "Build my resume"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in or register to use AI polishing features.", {
                      action: {
                        label: "Sign In",
                        onClick: () => navigate({ to: "/auth", search: { redirect: "/" } })
                      }
                    });
                    return;
                  }
                  if (!canPolishResume()) {
                    setUpgradeReason("You have used your 2 free AI Resume Polishes. Upgrade to Pro for unlimited polishes.");
                    setIsUpgradeModalOpen(true);
                    return;
                  }
                  polish.mutate();
                }}
                disabled={polish.isPending || !data.name.trim()}
              >
                {polish.isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {polish.isPending ? "Polishing…" : "Polish current resume"}
              </Button>
            </div>
          </section>

          <AdSlot label="Footer leaderboard — 728x90" className="mt-12 h-24 sm:h-28" />

          <section className="mt-16 space-y-4">
            <h2 className="font-display text-2xl font-semibold">
              How the AI resume builder works
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">1. Describe your background.</strong> Paste an
                old resume or type rough notes — job titles, dates, wins, education.
              </li>
              <li>
                <strong className="text-foreground">2. AI structures and writes it.</strong> Gemini
                turns your notes into quantified achievement bullets, a summary and a keyword-rich
                skills list.
              </li>
              <li>
                <strong className="text-foreground">3. Pick a template and edit.</strong> Switch
                designs instantly; every field stays editable in the form.
              </li>
              <li>
                <strong className="text-foreground">4. Download.</strong> Export a print-perfect A4
                PDF, or a plain-text version for job boards that only accept pasted text.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground">
              Want a score before you apply? Run the finished resume through the{" "}
              <a className="text-primary underline-offset-4 hover:underline" href="/ats-checker">
                free ATS resume checker
              </a>
              .
            </p>
          </section>

          <SiteFooter />
        </main>

        <AdSlot
          label="Right skyscraper — 160x600"
          className="sticky top-8 hidden h-[600px] w-32 shrink-0 lg:flex xl:w-40"
        />
      </div>
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason={upgradeReason}
      />
    </>
  );
}
