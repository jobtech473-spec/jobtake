import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingPlans } from "./PricingPlans";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/employers/login");
  if (me.role !== "EMPLOYER" && me.role !== "ADMIN") redirect("/dashboard");

  const company = await prisma.company.findFirst({
    where: { ownerId: me.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, jobCredits: true },
  });

  const launchOfferClaimed = company
    ? !!(await prisma.creditTransaction.findFirst({
        where: { companyId: company.id, plan: "LAUNCH_FREE" },
        select: { id: true },
      }))
    : false;

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

      <PricingPlans launchOfferClaimed={launchOfferClaimed} isEmployer={me.role === "EMPLOYER"} />
    </DashboardShell>
  );
}
