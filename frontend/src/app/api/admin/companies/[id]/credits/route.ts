import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  delta: z.number().int().refine(v => v !== 0, "delta cannot be 0"),
  note: z.string().optional(),
});

// Lets admin manually grant (or claw back) job-posting credits for a
// company — e.g. comping a few free posts, or correcting a dummy-checkout
// mistake — outside of the normal paid-plan flow.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: data.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { id }, select: { id: true, jobCredits: true } });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextCredits = Math.max(0, company.jobCredits + data.data.delta);
  const appliedDelta = nextCredits - company.jobCredits;

  const [updated] = await prisma.$transaction([
    prisma.company.update({ where: { id }, data: { jobCredits: nextCredits } }),
    prisma.creditTransaction.create({
      data: {
        companyId: id,
        plan: "ADMIN_GRANT",
        jobs: appliedDelta,
        amount: 0,
        status: "PAID",
        note: data.data.note,
        createdById: me.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, jobCredits: updated.jobCredits });
}
