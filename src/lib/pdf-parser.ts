export async function extractPdfText(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    interface TextItem {
      str: string;
      x: number;
      y: number;
      width: number;
      hasWriteSpaces?: boolean;
    }

    const items: TextItem[] = content.items
      .filter((item): item is any => "str" in item)
      .map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        hasWriteSpaces: item.hasWriteSpaces,
      }));

    if (items.length === 0) {
      pages.push("");
      continue;
    }

    // Group items into lines based on Y coordinate similarity
    const tolerance = 4.0;
    const lines: TextItem[][] = [];

    for (const item of items) {
      let foundLine = false;
      for (const line of lines) {
        if (Math.abs(line[0].y - item.y) <= tolerance) {
          line.push(item);
          foundLine = true;
          break;
        }
      }
      if (!foundLine) {
        lines.push([item]);
      }
    }

    // Sort lines by Y coordinate descending (top to bottom)
    lines.sort((a, b) => {
      const avgYA = a.reduce((sum, item) => sum + item.y, 0) / a.length;
      const avgYB = b.reduce((sum, item) => sum + item.y, 0) / b.length;
      return avgYB - avgYA;
    });

    // Sort items within each line by X coordinate ascending (left to right)
    for (const line of lines) {
      line.sort((a, b) => a.x - b.x);
    }

    // Build the string representation for the page
    const pageLines = lines
      .map((line) => {
        let lineText = "";
        for (let j = 0; j < line.length; j++) {
          const item = line[j];
          if (j > 0) {
            const prevItem = line[j - 1];
            // Insert space if there is a gap or hasWriteSpaces is true
            const gap = item.x - (prevItem.x + prevItem.width);
            const needsSpace =
              !lineText.endsWith(" ") &&
              !item.str.startsWith(" ") &&
              (gap > 1.5 || prevItem.hasWriteSpaces || item.hasWriteSpaces);

            if (needsSpace) {
              lineText += " ";
            }
          }
          lineText += item.str;
        }
        return lineText.trim();
      })
      .filter((line) => line.length > 0);

    pages.push(pageLines.join("\n"));
  }

  return pages.join("\n\n").trim();
}
