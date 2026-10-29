import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getClaimedFreePlanIds } from "@/lib/free-plan";

const Body = z.object({ planId: z.string() });

// Dummy/test-mode checkout — no real Razorpay account is wired up yet, so
// this simulates an always-successful payment. Swap this for a real
// Razorpay order-create + signature-verify flow once live keys exist; the
// credit-granting logic below stays the same either way.
export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: data.data.planId } });
  if (!plan || !plan.active) return NextResponse.json({ error: "This plan isn't available" }, { status: 400 });

  const company = await prisma.company.findFirst({ where: { ownerId: me.id }, orderBy: { createdAt: "asc" } });
  if (!company) return NextResponse.json({ error: "No company found on your account" }, { status: 400 });

  // Free plans (e.g. a launch offer) can only be claimed once per employer
  // account and once per GST number — not once per company.
  if (plan.price === 0) {
    const claimed = await getClaimedFreePlanIds(me.id, company.gstNumber, [plan.id]);
    if (claimed.has(plan.id)) return NextResponse.json({ error: "You've already claimed this free plan" }, { status: 409 });
  }

  const dummyOrderId = plan.price > 0 ? `order_dummy_${Date.now()}` : null;
  const dummyPaymentId = plan.price > 0 ? `pay_dummy_${Date.now()}` : null;

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
