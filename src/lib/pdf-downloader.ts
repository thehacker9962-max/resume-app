export async function downloadHtmlAsPdf(
  htmlContent: string,
  cssContent: string,
  filename: string,
) {
  // 1. Create an isolated iframe to host the print layout.
  // This prevents html2canvas from parsing the parent window's stylesheets
  // which contain unsupported modern CSS functions like 'oklch'.
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error("Could not create PDF generation context.");
  }

  // 2. Write content and load html2pdf script inside the iframe itself
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          ${cssContent}
          body { margin: 0; padding: 0; background-color: #ffffff; color: #000000; }
          .page { padding: 0; margin: 0; }
        </style>
      </head>
      <body>
        <div class="page">${htmlContent}</div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // 3. Wait for html2pdf script to load inside the iframe
  await new Promise<void>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if ((iframe.contentWindow as any)?.html2pdf) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 50);
    // Timeout after 15 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error("Failed to load PDF library in isolated context."));
    }, 15000);
  });

  // Give resources a brief moment to layout/render inside the iframe
  await new Promise((resolve) => setTimeout(resolve, 150));

  // 4. Configure html2pdf options
  const iframeWindow = iframe.contentWindow as any;
  const iframeArray = iframeWindow?.Array || Array;
  const opt = {
    margin: new iframeArray(15, 16, 15, 16), // 15mm top/bottom, 16mm left/right
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2.5, // High resolution scale for crisper fonts
      useCORS: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // 5. Generate and download PDF
  try {
    const pdfBlob = await iframeWindow.html2pdf().set(opt).from(iframeDoc.body).output("blob");

    // Check if showSaveFilePicker is supported (allows choosing exact local folder/name)
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "PDF Document",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User closed the file dialog without saving
          return;
        }
        console.warn("showSaveFilePicker failed, falling back to auto-download:", err);
      }
    }

    // Fallback: Default download anchor link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    // 6. Clean up iframe
    iframe.remove();
  }
}

declare global {
  interface Window {
    html2pdf: any;
  }
}
