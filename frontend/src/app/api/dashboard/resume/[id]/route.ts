import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== me.id) return jsonError("Not found", 404);

  await prisma.resume.delete({ where: { id } });

  if (existing.isPrimary) {
    const next = await prisma.resume.findFirst({ where: { userId: me.id }, orderBy: { createdAt: "desc" } });
    if (next) await prisma.resume.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  return jsonOk({ ok: true });
}
