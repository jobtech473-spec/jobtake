import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { z } from "zod";

const Body = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing || existing.userId !== me.id) return jsonError("Not found", 404);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError("Invalid data", 400);
  const { title, company, location, startDate, endDate, current, description } = parsed.data;

  const experience = await prisma.experience.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(company !== undefined ? { company: company.trim() } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
      ...(current !== undefined ? { current } : {}),
      endDate: current ? null : (endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
    },
  });

  return jsonOk({ experience });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await params;

  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing || existing.userId !== me.id) return jsonError("Not found", 404);

  await prisma.experience.delete({ where: { id } });
  return jsonOk({ ok: true });
}
