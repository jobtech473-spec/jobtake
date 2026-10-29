import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export async function POST() {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = getPlan("LAUNCH_FREE")!;

  const company = await prisma.company.findFirst({ where: { ownerId: me.id }, orderBy: { createdAt: "asc" } });
  if (!company) return NextResponse.json({ error: "No company found on your account" }, { status: 400 });

  const alreadyClaimed = await prisma.creditTransaction.findFirst({
    where: { companyId: company.id, plan: "LAUNCH_FREE" },
    select: { id: true },
  });
  if (alreadyClaimed) return NextResponse.json({ error: "You've already claimed the Launch Offer" }, { status: 409 });

  const [, transaction] = await prisma.$transaction([
    prisma.company.update({ where: { id: company.id }, data: { jobCredits: { increment: plan.jobs } } }),
    prisma.creditTransaction.create({
      data: { companyId: company.id, plan: plan.id, jobs: plan.jobs, amount: 0, status: "PAID" },
    }),
  ]);

  return NextResponse.json({ ok: true, transaction });
}
