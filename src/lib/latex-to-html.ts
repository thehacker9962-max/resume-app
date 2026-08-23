// Minimal LaTeX -> HTML renderer for resume documents.
// Handles the subset of commands our AI generator emits so we can show an
// A4 preview and print it to PDF without a full TeX engine.

function escapeHtml(value: string): string {
  return value
    .replace(/&(?![a-z]+;)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(raw: string): string {
  let text = raw;

  // hrefs / urls before escaping so braces survive
  const links: string[] = [];
  text = text.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, (_m, url, label) => {
    links.push(`<a href="${url}">${escapeHtml(label)}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  text = text.replace(/\\url\{([^}]*)\}/g, (_m, url) => {
    links.push(`<a href="${url}">${escapeHtml(url)}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });

  text = escapeHtml(text);

  text = text
    .replace(/\\textbf\{([^{}]*)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^{}]*)\}/g, "<em>$1</em>")
    .replace(/\\emph\{([^{}]*)\}/g, "<em>$1</em>")
    .replace(/\\underline\{([^{}]*)\}/g, "<u>$1</u>")
    .replace(/\\texttt\{([^{}]*)\}/g, "<code>$1</code>")
    .replace(/\\textsc\{([^{}]*)\}/g, '<span style="font-variant:small-caps">$1</span>')
    .replace(/\\hfill/g, '<span class="tex-fill"></span>')
    .replace(/\$\\(?:cdot|bullet)\$|\\textbullet/g, "&middot;")
    .replace(/\$\\(?:mid|vert)\$/g, "|")
    .replace(/\$([^$]*)\$/g, "$1")
    .replace(/---/g, "&mdash;")
    .replace(/--/g, "&ndash;")
    .replace(/\\(?:LaTeX|TeX)\b/g, "LaTeX")
    .replace(/\\&/g, "&amp;")
    .replace(/\\[%$#_{}]/g, (m) => m.slice(1))
    .replace(/~/g, "&nbsp;")
    .replace(/\\(?:small|large|Large|LARGE|huge|Huge|normalsize|bfseries|itshape|scshape)\b/g, "")
    .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
    .replace(/\\(?:noindent|centering|raggedright|par|item)\b/g, "")
    .replace(/[{}]/g, "");

  return text.replace(/\u0000(\d+)\u0000/g, (_m, i) => links[Number(i)] ?? "");
}

export function latexToHtml(source: string): string {
  if (!source.trim()) return "";

  let body = source;
  const doc = body.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (doc) body = doc[1] ?? body;

  // strip comments and unsupported blocks
  body = body
    .replace(/(^|[^\\])%.*$/gm, "$1")
    .replace(/\\(?:pagestyle|thispagestyle|titleformat|titlespacing|setlist|renewcommand|newcommand|definecolor|input|usepackage|documentclass|geometry|hypersetup)\*?(\[[^\]]*\])?(\{[^{}]*\})*/g, "");

  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  const listStack: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const begin = line.match(/^\\begin\{(itemize|enumerate|center|tabular\*?|tabularx)\}(.*)$/);
    if (begin) {
      const env = begin[1];
      if (env === "itemize") {
        listStack.push("ul");
        out.push("<ul>");
      } else if (env === "enumerate") {
        listStack.push("ol");
        out.push("<ol>");
      } else if (env === "center") {
        out.push('<div class="tex-center">');
      } else {
        out.push('<div class="tex-table">');
      }
      continue;
    }

    const end = line.match(/^\\end\{(itemize|enumerate|center|tabular\*?|tabularx)\}/);
    if (end) {
      const env = end[1];
      if (env === "itemize" || env === "enumerate") {
        out.push(`</${listStack.pop() ?? "ul"}>`);
      } else {
        out.push("</div>");
      }
      continue;
    }

    if (/^\\(?:begin|end)\{/.test(line)) continue;

    if (/\\(?:LARGE|huge|Huge)\b/.test(line)) {
      const name = inline(line.replace(/\\\\\s*$/, ""));
      if (name.trim()) out.push(`<h1>${name}</h1>`);
      continue;
    }

    const section = line.match(/^\\(section|subsection|subsubsection)\*?\{([\s\S]*?)\}\s*$/);
    if (section) {
      const tag = section[1] === "section" ? "h2" : "h3";
      out.push(`<${tag}>${inline(section[2] ?? "")}</${tag}>`);
      continue;
    }

    if (/^\\(?:hrule|rule|hline|noindent\s*$|maketitle|newpage|clearpage)/.test(line)) {
      if (/hrule|hline|rule/.test(line)) out.push('<hr />');
      continue;
    }

    const item = line.match(/^\\item\s*(.*)$/);
    if (item) {
      out.push(`<li>${inline(item[1] ?? "")}</li>`);
      continue;
    }

    // table-ish rows / line breaks
    const cells = line.replace(/\\\\\s*(\[[^\]]*\])?$/, "").split(/(?<!\\)&/);
    const rendered = cells.map(inline).filter((c) => c.trim() !== "");
    if (rendered.length === 0) continue;
    if (rendered.length > 1) {
      out.push(`<div class="tex-row">${rendered.map((c) => `<span>${c}</span>`).join("")}</div>`);
    } else if (listStack.length > 0) {
      // continuation inside a list item
      out.push(`<div class="tex-line">${rendered[0]}</div>`);
    } else {
      const single = rendered[0] ?? "";
      out.push(
        single.includes("tex-fill")
          ? `<div class="tex-row tex-inline">${single}</div>`
          : `<p>${single}</p>`,
      );
    }
  }

  return out.join("\n");
}

export const RESUME_PRINT_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .page {
    font-family: "Times New Roman", Georgia, serif;
    color: #111;
    background: #fff;
    font-size: 10.5pt;
    line-height: 1.35;
  }
  .page, .page * { font-family: "Times New Roman", Georgia, serif !important; }
  .page h1 { font-size: 19pt; margin: 0 0 4pt; text-align: center; letter-spacing: normal; }
  .page h2 {
    font-size: 11.5pt; text-transform: uppercase; letter-spacing: .06em;
    margin: 12pt 0 3pt; padding-bottom: 2pt; border-bottom: .7pt solid #111;
    break-after: avoid; page-break-after: avoid;
  }
  .page h3 { font-size: 10.5pt; margin: 7pt 0 2pt; letter-spacing: normal; break-after: avoid; page-break-after: avoid; }
  .page p { margin: 3pt 0; break-inside: avoid; page-break-inside: avoid; }
  .page ul, .page ol { margin: 3pt 0 3pt 14pt; padding: 0; }
  .page li { margin: 1.5pt 0; break-inside: avoid; page-break-inside: avoid; }
  .page a { color: #0b3d91; text-decoration: none; }
  .page hr { border: 0; border-top: .7pt solid #111; margin: 6pt 0; break-after: avoid; page-break-after: avoid; }
  .page .tex-center { text-align: center; }
  .page .tex-row { display: flex; justify-content: space-between; gap: 12pt; break-inside: avoid; page-break-inside: avoid; }
  .page .tex-row span:last-child { text-align: right; white-space: nowrap; }
  .page .tex-fill { flex: 1; }
  .page .tex-inline { margin: 3pt 0; }
  .page .tex-inline > span:last-child { text-align: left; }
  .page .tex-line { margin: 2pt 0; break-inside: avoid; page-break-inside: avoid; }
  .page code { font-family: inherit; }
`;