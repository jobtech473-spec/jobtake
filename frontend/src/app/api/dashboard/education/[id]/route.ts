import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { z } from "zod";

const Body = z.object({
  school: z.string().min(1).optional(),
  degree: z.string().min(1).optional(),
  field: z.string().optional().nullable(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.education.findUnique({ where: { id } });
  if (!existing || existing.userId !== me.id) return jsonError("Not found", 404);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError("Invalid data", 400);
  const { school, degree, field, startYear, endYear, description } = parsed.data;

  const education = await prisma.education.update({
    where: { id },
    data: {
      ...(school !== undefined ? { school: school.trim() } : {}),
      ...(degree !== undefined ? { degree: degree.trim() } : {}),
      ...(field !== undefined ? { field: field?.trim() || null } : {}),
      ...(startYear !== undefined ? { startYear } : {}),
      ...(endYear !== undefined ? { endYear } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
    },
  });

  return jsonOk({ education });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.education.findUnique({ where: { id } });
  if (!existing || existing.userId !== me.id) return jsonError("Not found", 404);

  await prisma.education.delete({ where: { id } });
  return jsonOk({ ok: true });
}
