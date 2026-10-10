import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationsClient } from "./ApplicationsClient";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") redirect("/login");

  const [applications, savedCount] = await Promise.all([
    prisma.application.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      include: { job: { include: { company: { select: { name: true, slug: true, logoUrl: true } } } } },
    }),
    prisma.savedJob.count({ where: { userId: me.id } }),
  ]);

  const apps = applications.map(a => ({
    id: a.id,
    title: a.job.title,
    company: a.job.company.name,
    logoUrl: a.job.company.logoUrl,
    slug: a.job.slug,
    employmentType: a.job.employmentType ?? "Full-time",
    location: a.job.location ?? "India",
    stage: a.stage as string,
    matchScore: a.matchScore,
    createdAt: a.createdAt.toISOString(),
    updatedAt: (a.updatedAt ?? a.createdAt).toISOString(),
  }));

  return (
    <DashboardShell role="SEEKER" current="/dashboard/applications">
      <ApplicationsClient applications={apps} savedCount={savedCount} />
    </DashboardShell>
  );
}
