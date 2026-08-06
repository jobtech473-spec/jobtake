import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getManagedOptions } from "@/lib/job-options";
import { redirect } from "next/navigation";
import { CompanyEditForm } from "./CompanyEditForm";

export default async function CompanyEditPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") redirect("/employers/login");

  const [company, options] = await Promise.all([
    prisma.company.findFirst({
      where: { ownerId: me.id },
      orderBy: { createdAt: "asc" },
      include: { benefits: true },
    }),
    getManagedOptions(true, true),
  ]);

  return (
    <DashboardShell role="EMPLOYER" current="/employer/company">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">Company Profile</p>
        <h1 className="text-2xl font-black text-zinc-900 mt-1">Edit Company Details</h1>
        <p className="text-sm text-zinc-500 mt-1">Update your company information to attract better candidates.</p>
      </div>
      <CompanyEditForm company={company} industryOptions={options.INDUSTRY} />
    </DashboardShell>
  );
}
