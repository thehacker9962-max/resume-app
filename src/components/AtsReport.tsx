import { AlertTriangle, CheckCircle2, Info, Sparkles, Wand2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Analysis } from "@/lib/resume.schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function ScoreRing({ score }: { score: number }) {
  const label = score >= 80 ? "Strong" : score >= 60 ? "Needs work" : "At risk";
  return (
    <div className="flex items-center gap-5">
      <div
        className="grid size-28 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-primary) ${score * 3.6}deg, var(--color-secondary) 0deg)`,
        }}
      >
        <div className="grid size-22 place-items-center rounded-full bg-card">
          <span className="font-display text-3xl font-bold">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">ATS score</p>
        <p className="font-display text-2xl font-semibold">{label}</p>
      </div>
    </div>
  );
}

const severityIcon = {
  critical: AlertTriangle,
  warning: Info,
  minor: Info,
} as const;

type Props = {
  analysis: Analysis;
  onImprove: () => void;
  isImproving: boolean;
  improved: string;
  onSendToLatex: () => void;
};

export function AtsReport({ analysis, onImprove, isImproving, improved, onSendToLatex }: Props) {
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <ScoreRing score={analysis.score} />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {analysis.verdict}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {analysis.categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="text-muted-foreground">{category.score}</span>
              </div>
              <Progress value={category.score} />
              <p className="text-xs text-muted-foreground">{category.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h3 className="text-base font-semibold">Keywords</h3>
          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Missing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.missingKeywords.length ? (
              analysis.missingKeywords.map((keyword) => (
                <Badge key={keyword} variant="destructive">
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nothing critical missing.</span>
            )}
          </div>
          <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Matched</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.matchedKeywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-base font-semibold">What is already working</h3>
          <ul className="mt-4 space-y-3">
            {analysis.strengths.map((strength) => (
              <li key={strength} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel p-6">
        <h3 className="text-base font-semibold">Fix these to raise your score</h3>
        <div className="mt-4 space-y-4">
          {analysis.issues.map((issue) => {
            const Icon = severityIcon[issue.severity] ?? Info;
            return (
              <div key={issue.title} className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    className={
                      issue.severity === "critical"
                        ? "size-4 text-destructive"
                        : "size-4 text-accent"
                    }
                  />
                  <p className="font-medium">{issue.title}</p>
                  <Badge variant="outline" className="ml-auto capitalize">
                    {issue.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{issue.detail}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium text-primary">Fix: </span>
                  {issue.fix}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {analysis.improvedBullets.length > 0 && (
        <section className="panel p-6">
          <h3 className="text-base font-semibold">Rewritten bullets</h3>
          <div className="mt-4 space-y-4">
            {analysis.improvedBullets.map((bullet) => (
              <div key={bullet.after} className="grid gap-2 md:grid-cols-2">
                <p className="rounded-md bg-secondary/40 p-3 text-sm text-muted-foreground line-through decoration-destructive/60">
                  {bullet.before}
                </p>
                <p className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                  {bullet.after}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">AI-optimised resume</h3>
            <p className="text-sm text-muted-foreground">
              A full rewrite, ATS-safe and keyword aligned.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onImprove} disabled={isImproving}>
              {isImproving ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {improved ? "Regenerate" : "Improve my resume"}
            </Button>
            {improved && (
              <Button variant="secondary" onClick={onSendToLatex}>
                <Sparkles /> Build LaTeX version
              </Button>
            )}
          </div>
        </div>

        {analysis.rewrittenSummary && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Suggested summary
            </p>
            <p className="mt-2 text-sm leading-relaxed">{analysis.rewrittenSummary}</p>
          </div>
        )}

        {improved && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Optimised resume
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(improved);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg border border-border bg-background/60 p-4 font-mono text-xs whitespace-pre-wrap">
              {improved}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}