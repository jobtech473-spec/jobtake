import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  price: z.number().int().min(0),
  jobs: z.number().int().min(1),
  perJob: z.number().int().min(0).optional().nullable(),
  save: z.number().int().min(0).optional().nullable(),
  badge: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: data.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const count = await prisma.subscriptionPlan.count();
  const plan = await prisma.subscriptionPlan.create({
    data: { ...data.data, sortOrder: data.data.sortOrder ?? count },
  });
  return NextResponse.json({ plan });
}
