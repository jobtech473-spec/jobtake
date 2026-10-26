import mammoth from "mammoth";

export type ResumePreview =
  | { type: "pdf" }
  | { type: "html"; html: string }
  | { type: "unsupported" };

export async function buildResumePreview(resume: { fileName: string; fileUrl: string }): Promise<ResumePreview> {
  const ext = resume.fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { type: "pdf" };
  if (ext === "doc" || ext === "docx") {
    try {
      const base64 = resume.fileUrl.slice(resume.fileUrl.indexOf(",") + 1);
      const buffer = Buffer.from(base64, "base64");
      const { value: html } = await mammoth.convertToHtml({ buffer });
      return { type: "html", html };
    } catch {
      return { type: "unsupported" };
    }
  }
  return { type: "unsupported" };
}
