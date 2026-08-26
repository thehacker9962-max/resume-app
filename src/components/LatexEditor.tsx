import { useState } from "react";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "@/hooks/use-navigate";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/ResumePreview";

const PRESETS: string[] = [
  "Generate a clean one-page ATS-friendly resume from my resume text",
  "Tighten the spacing so everything fits on one page",
  "Add a Projects section with three entries",
  "Convert all bullets to quantified achievement statements",
];

type Props = {
  code: string;
  onCodeChange: (value: string) => void;
  onGenerate: (instruction: string) => void;
  isGenerating: boolean;
};

export function LatexEditor({ code, onCodeChange, onGenerate, isGenerating }: Props) {
  const [instruction, setInstruction] = useState<string>(
    "Generate a clean one-page ATS-friendly resume from my resume text",
  );

  const { canPerformDownload, registerDownload } = useAuth();
  const navigate = useNavigate();

  function download() {
    if (!canPerformDownload()) {
      toast.error("Please sign in to download your resume again.");
      navigate({ to: "/auth", search: { redirect: "/ats-checker" } });
      return;
    }

    const url = URL.createObjectURL(new Blob([code], { type: "text/x-tex" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.tex";
    link.click();
    URL.revokeObjectURL(url);
    registerDownload();
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h2 className="text-lg font-semibold">Ask AI to write or edit your LaTeX</h2>
        <p className="text-sm text-muted-foreground">
          Describe the change — the AI rewrites the full document.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="e.g. add a Publications section"
            onKeyDown={(event) => {
              if (event.key === "Enter" && instruction.trim()) onGenerate(instruction);
            }}
          />
          <Button
            onClick={() => onGenerate(instruction)}
            disabled={isGenerating || instruction.trim().length < 3}
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isGenerating ? "Writing LaTeX…" : "Generate"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setInstruction(preset)}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="font-mono text-xs text-muted-foreground">resume.tex</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={!code}
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("LaTeX copied");
              }}
            >
              <Copy /> Copy
            </Button>
            <Button size="sm" variant="secondary" disabled={!code} onClick={download}>
              <Download /> .tex
            </Button>
          </div>
        </div>
        <Textarea
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          spellCheck={false}
          placeholder="% Your LaTeX document will appear here…"
          className="min-h-[32rem] resize-y rounded-none border-0 bg-transparent font-mono text-xs leading-relaxed focus-visible:ring-0"
        />
        <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          Download the .tex file and compile it in Overleaf or any LaTeX engine to get your PDF.
        </p>
      </section>

      <ResumePreview code={code} />
    </div>
  );
}