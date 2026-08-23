import { Check, Image } from "lucide-react";
import { TEMPLATES, type TemplateId, renderResumeHtml, templateCss } from "@/lib/resume-templates";
import { SAMPLE_RESUME } from "@/lib/sample-resume";
import { cn } from "@/lib/utils";

type Props = {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 scrollbar-none">
      {TEMPLATES.map((template) => {
        const active = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            aria-pressed={active}
            className={cn(
              "rounded-xl border overflow-hidden text-left transition-colors flex flex-col h-full shrink-0 w-[280px] sm:w-auto snap-start",
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {/* Visual template preview */}
            <div className="h-[200px] w-full overflow-hidden bg-secondary/30 p-2 border-b border-border flex items-start justify-center">
              <div className="h-[297mm] w-[55mm] overflow-hidden">
                <div
                  className="w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] text-black shadow-sm"
                  style={{ transform: "scale(0.26)", transformOrigin: "top left" }}
                >
                  <style>{templateCss(template.id, `tpl-pick-${template.id}`)}</style>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderResumeHtml(template.id, SAMPLE_RESUME, `tpl-pick-${template.id}`),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow w-full">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold">{template.name}</span>
                  <span className="flex items-center gap-1">
                    {template.photo && (
                      <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Image className="size-3" /> Photo
                      </span>
                    )}
                    {active && <Check className="size-4 text-primary" />}
                  </span>
                </div>
                <span
                  className="mt-2 block h-1.5 w-12 rounded-full"
                  style={{ backgroundColor: template.accent }}
                />
                <p className="mt-2 text-xs text-muted-foreground">{template.tagline}</p>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                Best for: {template.bestFor}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
