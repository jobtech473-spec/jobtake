import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PartnerLogosEditor } from "./PartnerLogosEditor";

export default async function AdminPartnerLogosPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");
  const items = await prisma.partnerLogo.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <DashboardShell role="ADMIN" current="/admin/partner-logos">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-zinc-900">Homepage Company Logos</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage the "Top companies hiring on Jobtake" logo strip on the homepage.</p>
      </div>
      <PartnerLogosEditor items={items.map(l => ({ id: l.id, name: l.name, logoUrl: l.logoUrl, websiteUrl: l.websiteUrl, sortOrder: l.sortOrder, active: l.active }))} />
    </DashboardShell>
  );
}
