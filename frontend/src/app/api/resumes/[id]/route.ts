import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = resume.userId === me.id;
  const isAdmin = me.role === "ADMIN";
  let isEmployerWithAccess = false;
  if (!isOwner && !isAdmin && me.role === "EMPLOYER") {
    const app = await prisma.application.findFirst({
      where: { userId: resume.userId, job: { postedById: me.id } },
      select: { id: true },
    });
    isEmployerWithAccess = !!app;
  }
  if (!isOwner && !isAdmin && !isEmployerWithAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const match = resume.fileUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Invalid file" }, { status: 500 });
  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `inline; filename="${resume.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
