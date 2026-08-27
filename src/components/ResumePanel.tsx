import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { extractPdfTextClient } from "@/lib/pdf-parser.client";


type Props = {
  resume: string;
  onResumeChange: (value: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
};

export function ResumePanel({
  resume,
  onResumeChange,
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isAnalyzing,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setParsing(true);
    try {
      const text =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
          ? await extractPdfTextClient(file)
          : await file.text();
      if (!text) throw new Error("No selectable text found.");
      onResumeChange(text);
      toast.success(`Loaded ${file.name}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not read that file. Try pasting the text instead.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your resume</h2>
          <p className="text-sm text-muted-foreground">
            Upload a PDF or TXT file, or paste the plain text.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={parsing}>
          {parsing ? <Loader2 className="animate-spin" /> : <Upload />}
          {parsing ? "Reading…" : "Upload file"}
        </Button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resume">Resume text</Label>
          <Textarea
            id="resume"
            value={resume}
            onChange={(event) => onResumeChange(event.target.value)}
            placeholder="Paste your full resume here…"
            className="min-h-64 font-mono text-xs leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">{resume.trim().length} characters</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd">Target job description (optional, boosts accuracy)</Label>
          <Textarea
            id="jd"
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            placeholder="Paste the job posting you are applying to…"
            className="min-h-64 text-sm leading-relaxed"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="mt-5 w-full sm:w-auto"
        onClick={onAnalyze}
        disabled={isAnalyzing || resume.trim().length < 50}
      >
        {isAnalyzing ? <Loader2 className="animate-spin" /> : <FileText />}
        {isAnalyzing ? "Scoring your resume…" : "Check ATS score"}
      </Button>
    </section>
  );
}