import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { latexToHtml, RESUME_PRINT_CSS } from "@/lib/latex-to-html";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "@/hooks/use-navigate";
import { downloadHtmlAsPdf } from "@/lib/pdf-downloader";

type Props = { code: string };

export function ResumePreview({ code }: Props) {
  const html = useMemo(() => latexToHtml(code), [code]);

  const { canPerformDownload, registerDownload } = useAuth();
  const navigate = useNavigate();

  async function downloadPdf() {
    if (!html) return;
    if (!canPerformDownload()) {
      toast.error("Please sign in to download your resume again.");
      navigate({ to: "/auth", search: { redirect: "/ats-checker" } });
      return;
    }

    const toastId = toast.loading("Generating PDF download...");
    try {
      await downloadHtmlAsPdf(html, RESUME_PRINT_CSS, "resume.pdf");
      registerDownload();
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(`Could not download the PDF: ${error?.message || String(error)}`, { id: toastId });
    }
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5 text-primary" /> A4 resume preview
        </p>
        <Button size="sm" disabled={!html} onClick={downloadPdf}>
          <Download /> Download PDF
        </Button>
      </div>

      {html ? (
        <div className="overflow-x-auto bg-secondary/30 p-4 sm:p-6">
          <div
            className="mx-auto w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] text-black shadow-2xl"
          >
            <style>{RESUME_PRINT_CSS}</style>
            <div className="page" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Generate LaTeX above to see the rendered A4 resume here.
        </p>
      )}
    </section>
  );
}