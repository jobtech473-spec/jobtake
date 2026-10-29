import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingPlans } from "./PricingPlans";
import { getClaimedFreePlanIds } from "@/lib/free-plan";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/employers/login");
  if (me.role !== "EMPLOYER" && me.role !== "ADMIN") redirect("/dashboard");

  const [plans, company] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.company.findFirst({ where: { ownerId: me.id }, orderBy: { createdAt: "asc" }, select: { id: true, jobCredits: true, gstNumber: true } }),
  ]);

  const claimedFreePlanIds = await getClaimedFreePlanIds(me.id, company?.gstNumber ?? null, plans.filter(p => p.price === 0).map(p => p.id));

  return (
    <DashboardShell role={me.role === "ADMIN" ? "ADMIN" : "EMPLOYER"} current="/employer/pricing">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          Simple &amp; Transparent Pricing
        </span>
        <h1 className="text-3xl font-black text-zinc-900 mt-4">
          Post Jobs. Find Great Talent.<br />
          <span className="text-blue-600">At a Price That Works for You.</span>
        </h1>
        <p className="text-zinc-500 mt-2">No subscriptions. Pay only for job postings.</p>
        <p className="text-sm text-zinc-600 mt-3">
          You currently have <span className="font-bold text-zinc-900">{company?.jobCredits ?? 0}</span> job posting credit{(company?.jobCredits ?? 0) === 1 ? "" : "s"}.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-center text-zinc-400 text-sm">No plans are available right now. Please check back soon.</p>
      ) : (
        <PricingPlans
          plans={plans.map(p => ({
            id: p.id, name: p.name, tagline: p.tagline, price: p.price, jobs: p.jobs,
            perJob: p.perJob, save: p.save, badge: p.badge, features: p.features,
          }))}
          claimedFreePlanIds={Array.from(claimedFreePlanIds)}
          isEmployer={me.role === "EMPLOYER"}
        />
      )}
    </DashboardShell>
  );
}
