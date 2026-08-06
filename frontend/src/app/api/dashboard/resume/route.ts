import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { saveUpload } from "@/lib/uploads";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const resumes = await prisma.resume.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ resumes });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("resume");
  if (!file || !(file instanceof File) || file.size === 0) return jsonError("No file provided", 400);
  if (file.size > 5 * 1024 * 1024) return jsonError("File too large (max 5MB)", 400);

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!["pdf", "doc", "docx"].includes(ext)) return jsonError("Only PDF, DOC or DOCX allowed", 400);

  const saved = await saveUpload(file, "resume");

  await prisma.resume.updateMany({ where: { userId: me.id }, data: { isPrimary: false } });

  const resume = await prisma.resume.create({
    data: {
      userId: me.id,
      fileName: saved.fileName,
      fileUrl: saved.fileUrl,
      fileSize: saved.fileSize,
      isPrimary: true,
    },
  });

  return jsonOk({ resume }, 201);
}
