import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";
import { z } from "zod";

const ApplySchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
  resumeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "SEEKER") return NextResponse.json({ error: "Only seekers can apply" }, { status: 403 });

  const ct = req.headers.get("content-type") || "";
  let payload: { jobId: string; coverLetter?: string; resumeId?: string } = { jobId: "" };
  let resumeFile: File | null = null;

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    payload.jobId = String(form.get("jobId") || "");
    payload.coverLetter = form.get("coverLetter") ? String(form.get("coverLetter")) : undefined;
    payload.resumeId = form.get("resumeId") ? String(form.get("resumeId")) : undefined;
    const f = form.get("resume");
    if (f && f instanceof File && f.size > 0) {
      if (f.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Resume file too large (max 5MB)" }, { status: 400 });
      resumeFile = f;
    }
  } else {
    const json = await req.json().catch(() => ({}));
    const parsed = ApplySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    payload = parsed.data;
  }

  if (!payload.jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await prisma.job.findUnique({ where: { id: payload.jobId } });
  if (!job || job.status !== "PUBLISHED") return NextResponse.json({ error: "Job not available" }, { status: 404 });

  const dup = await prisma.application.findUnique({ where: { jobId_userId: { jobId: job.id, userId: user.id } } });
  if (dup) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  let resumeId = payload.resumeId;
  if (resumeFile) {
    const saved = await saveUpload(resumeFile, "resume");
    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: saved.fileName,
        fileUrl: saved.fileUrl,
        fileSize: saved.fileSize,
        isPrimary: true,
      },
    });
    resumeId = created.id;
  }

  const matchScore = 70 + Math.floor(Math.random() * 26);
  const app = await prisma.application.create({
    data: {
      jobId: job.id,
      userId: user.id,
      coverLetter: payload.coverLetter,
      resumeId,
      matchScore,
    },
  });
  await prisma.applicationEvent.create({ data: { applicationId: app.id, toStage: "APPLIED" } });
  await prisma.job.update({ where: { id: job.id }, data: { applicantsCount: { increment: 1 } } });

  await prisma.notification.create({
    data: {
      userId: job.postedById,
      kind: "APPLICATION_RECEIVED",
      title: `New applicant for ${job.title}`,
      body: `${user.name} applied — ${matchScore}% match`,
      linkUrl: `/employer/jobs/${job.id}/applicants`,
    },
  });

  return NextResponse.json({ application: app });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { job: { include: { company: { select: { name: true, logoUrl: true, slug: true } } } } },
  });
  return NextResponse.json({ applications: apps });
}
