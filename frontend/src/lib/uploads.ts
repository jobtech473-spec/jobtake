import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

export type SavedFile = {
  fileName: string;
  fileUrl: string;
  fileSize: number;
};

export async function saveUpload(file: File, _kind: string): Promise<SavedFile> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || mimeFromName(file.name);
  return {
    fileName: file.name,
    fileUrl: `data:${mime};base64,${buf.toString("base64")}`,
    fileSize: buf.length,
  };
}

export async function readUpload(fileName: string): Promise<Buffer | null> {
  // sanitize
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, fileName));
  } catch {
    return null;
  }
}

export function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const m: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return m[ext] || "application/octet-stream";
}
