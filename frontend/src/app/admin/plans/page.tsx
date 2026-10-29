import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PlansManager } from "./PlansManager";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const plans = await prisma.subscriptionPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });

  return (
    <DashboardShell role="ADMIN" current="/admin/plans">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-900">Subscription Plans</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage the job-posting plans employers see on the Pricing page.</p>
      </div>
      <PlansManager
        initialPlans={plans.map(p => ({
          id: p.id, name: p.name, tagline: p.tagline, price: p.price, jobs: p.jobs,
          perJob: p.perJob, save: p.save, badge: p.badge, features: p.features,
          active: p.active, sortOrder: p.sortOrder,
        }))}
      />
    </DashboardShell>
  );
}
