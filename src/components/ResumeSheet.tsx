import { useMemo, useState, useEffect, useRef } from "react";
import { Download, FileDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "@/hooks/use-navigate";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import type { ResumeData } from "@/lib/builder.schemas";
import {
  renderResumeHtml,
  resumeToPlainText,
  templateCss,
  type TemplateId,
} from "@/lib/resume-templates";
import { downloadHtmlAsPdf } from "@/lib/pdf-downloader";

type Props = { data: ResumeData; template: TemplateId };

export function ResumeSheet({ data, template }: Props) {
  const html = useMemo(() => renderResumeHtml(template, data), [template, data]);
  const css = useMemo(() => templateCss(template), [template]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      // Get padding-adjusted width
      const containerWidth = containerRef.current.getBoundingClientRect().width - 32;
      const a4Width = 794; // ~210mm in pixels at standard 96dpi
      if (containerWidth < a4Width && containerWidth > 0) {
        setScale(containerWidth / a4Width);
      } else {
        setScale(1);
      }
    };

    // Delay calculation slightly to ensure layout is complete
    const timeout = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [html, css]); // Recalculate on layout / content changes too

  async function downloadPdf() {
    const toastId = toast.loading("Generating PDF download...");
    try {
      const filename = `${(data.name || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      await downloadHtmlAsPdf(html, css, filename);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(`Could not download the PDF: ${error?.message || String(error)}`, { id: toastId });
    }
  }

  function downloadText() {
    const url = URL.createObjectURL(
      new Blob([resumeToPlainText(data)], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-ats.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  const { canPerformDownload, registerDownload } = useAuth();
  const navigate = useNavigate();

  const [adGateActive, setAdGateActive] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [pendingDownload, setPendingDownload] = useState<"pdf" | "txt" | null>(null);

  const startDownloadGate = (type: "pdf" | "txt") => {
    if (!canPerformDownload()) {
      toast.error("Please sign in to download your resume again.");
      navigate({ to: "/auth", search: { redirect: "/" } });
      return;
    }

    setPendingDownload(type);
    setAdGateActive(true);
    setAdCountdown(5);

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

  const executeDownload = async () => {
    if (pendingDownload === "pdf") {
      await downloadPdf();
    } else if (pendingDownload === "txt") {
      downloadText();
    }
    registerDownload();
    setAdGateActive(false);
    setPendingDownload(null);
  };

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5 text-primary" /> A4 live preview
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => startDownloadGate("txt")}>
            <FileDown /> .txt
          </Button>
          <Button size="sm" onClick={() => startDownloadGate("pdf")}>
            <Download /> Download PDF
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="overflow-hidden bg-secondary/30 p-4 flex justify-center items-start">
        <div 
          className="bg-white px-[16mm] py-[14mm] text-black shadow-2xl origin-top transition-transform duration-200"
          style={{ 
            width: "210mm",
            minHeight: "297mm",
            transform: `scale(${scale})`,
            marginBottom: `calc(297mm * (${scale} - 1))` // Pull up flow so blank spacing isn't left behind by scale down
          }}
        >
          <style>{css}</style>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      {/* Ad Download Gate */}
      {adGateActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-2xl text-center space-y-4 m-4">
            <h3 className="font-display text-lg font-bold">Preparing Download Link...</h3>
            <div className="flex justify-center py-1">
              <Loader2 className="size-7 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              {adCountdown > 0 
                ? `Formatting your document. Your link is ready in ${adCountdown}s...` 
                : "Your file is ready to download!"}
            </p>

            {/* In-modal Ad Unit */}
            <div className="border border-border rounded-lg bg-secondary/30 p-2 min-h-48 flex flex-col items-center justify-center">
              <AdSlot label="Download Interstitial Ad — 300x250" className="h-[250px] w-[300px]" />
            </div>

            <Button 
              onClick={executeDownload}
              disabled={adCountdown > 0}
              className="w-full mt-2"
            >
              {adCountdown > 0 
                ? `Wait ${adCountdown}s` 
                : `Download ${pendingDownload === "pdf" ? "PDF Document" : "TXT File"}`}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
