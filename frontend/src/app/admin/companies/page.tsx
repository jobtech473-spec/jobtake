import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CompaniesTable } from "./CompaniesTable";

export default async function AdminCompanies() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
      _count: { select: { jobs: true } },
    },
  });

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === "ACTIVE").length;
  const pendingCompanies = companies.filter(c => c.status === "PENDING").length;
  const verifiedCompanies = companies.filter(c => c.verified).length;
  const featuredCompanies = companies.filter(c => c.featured).length;

  return (
    <DashboardShell role="ADMIN" current="/admin/companies">
      <CompaniesTable
        companies={companies.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          logoUrl: c.logoUrl,
          industry: c.industry,
          size: c.size,
          headquarters: c.headquarters,
          status: c.status,
          verified: c.verified,
          featured: c.featured,
          createdAt: c.createdAt.toISOString(),
          jobsCount: c._count.jobs,
          gstNumber: c.gstNumber,
          gstCertificateUrl: c.gstCertificateUrl,
          owner: c.owner,
        }))}
        stats={{ totalCompanies, activeCompanies, pendingCompanies, verifiedCompanies, featuredCompanies }}
      />
    </DashboardShell>
  );
}
