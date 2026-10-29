import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

const Body = z.object({ plan: z.string() });

// Dummy/test-mode checkout — no real Razorpay account is wired up yet, so
// this simulates an always-successful payment. Swap this for a real
// Razorpay order-create + signature-verify flow once live keys exist; the
// credit-granting logic below stays the same either way.
export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const plan = getPlan(data.data.plan);
  if (!plan || plan.price <= 0) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const company = await prisma.company.findFirst({ where: { ownerId: me.id }, orderBy: { createdAt: "asc" } });
  if (!company) return NextResponse.json({ error: "No company found on your account" }, { status: 400 });

  const dummyOrderId = `order_dummy_${Date.now()}`;
  const dummyPaymentId = `pay_dummy_${Date.now()}`;

  const [, transaction] = await prisma.$transaction([
    prisma.company.update({ where: { id: company.id }, data: { jobCredits: { increment: plan.jobs } } }),
    prisma.creditTransaction.create({
      data: {
        companyId: company.id,
        plan: plan.id,
        jobs: plan.jobs,
        amount: plan.price,
        status: "PAID",
        razorpayOrderId: dummyOrderId,
        razorpayPaymentId: dummyPaymentId,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, transaction, jobCredits: company.jobCredits + plan.jobs });
}
