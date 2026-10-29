import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().optional().nullable(),
  price: z.number().int().min(0).optional(),
  jobs: z.number().int().min(1).optional(),
  perJob: z.number().int().min(0).optional().nullable(),
  save: z.number().int().min(0).optional().nullable(),
  badge: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: data.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const plan = await prisma.subscriptionPlan.update({ where: { id }, data: data.data }).catch(() => null);
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ plan });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.subscriptionPlan.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
