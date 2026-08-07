import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const saved = await prisma.savedJob.findMany({ where: { userId: me.id }, select: { jobId: true } });
  return jsonOk({ jobIds: saved.map(s => s.jobId) });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const jobId = body.jobId;
  if (!jobId || typeof jobId !== "string") return jsonError("jobId is required", 400);

  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) return jsonError("Job not found", 404);

  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: me.id, jobId } },
    update: {},
    create: { userId: me.id, jobId },
  });

  return jsonOk({ saved: true });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const jobId = body.jobId;
  if (!jobId || typeof jobId !== "string") return jsonError("jobId is required", 400);

  await prisma.savedJob.deleteMany({ where: { userId: me.id, jobId } });

  return jsonOk({ saved: false });
}
