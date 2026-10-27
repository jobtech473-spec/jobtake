import mammoth from "mammoth";
// Import the internal module directly — pdf-parse's package entry (index.js)
// has top-level "debug mode" code that reads a test fixture file whenever
// `module.parent` is falsy, which is always true once webpack bundles it,
// crashing the build. lib/pdf-parse.js is the same implementation without it.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export type ResumePreview =
  | { type: "html"; html: string }
  | { type: "unsupported" };

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Plain-text extraction (from pdf-parse) has no paragraph markup, so turn
// blank-line-separated blocks into <p> tags, same shape mammoth's HTML has.
function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

// Every resume — PDF or Word — renders as the same plain, formatted text
// preview, instead of PDFs opening in the browser's native PDF viewer.
export async function buildResumePreview(resume: { fileName: string; fileUrl: string }): Promise<ResumePreview> {
  const ext = resume.fileName.split(".").pop()?.toLowerCase();
  const base64 = resume.fileUrl.slice(resume.fileUrl.indexOf(",") + 1);
  const buffer = Buffer.from(base64, "base64");

  if (ext === "pdf") {
    try {
      const data = await pdfParse(buffer) as { text: string };
      return { type: "html", html: textToHtml(data.text) };
    } catch {
      return { type: "unsupported" };
    }
  }
  if (ext === "doc" || ext === "docx") {
    try {
      const { value: html } = await mammoth.convertToHtml({ buffer });
      return { type: "html", html };
    } catch {
      return { type: "unsupported" };
    }
  }
  return { type: "unsupported" };
}
