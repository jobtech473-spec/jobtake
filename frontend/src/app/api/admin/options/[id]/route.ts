import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Schema = z.object({
  type: z.enum(["LOCATION", "INDUSTRY", "ROLE", "CTC", "EXPERIENCE", "KEYWORD"]).optional(),
  label: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const data = Schema.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid option data" }, { status: 400 });

  const option = await prisma.jobOption.update({ where: { id }, data: data.data });
  return NextResponse.json({ option });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.jobOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
