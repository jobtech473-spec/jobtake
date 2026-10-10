import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SavedJobsClient } from "./SavedJobsClient";

export const dynamic = "force-dynamic";

export default async function SavedJobsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") redirect("/login");

  const saved = await prisma.savedJob.findMany({
    where: { userId: me.id },
    include: { job: { include: { company: { select: { name: true, slug: true, logoUrl: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const jobs = saved.map(s => ({
    id: s.id,
    title: s.job.title,
    company: s.job.company.name,
    logoUrl: s.job.company.logoUrl,
    slug: s.job.slug,
    employmentType: s.job.employmentType ?? "Full-time",
    location: s.job.location ?? "India",
    savedAt: s.createdAt.toISOString(),
    postedAt: s.job.createdAt?.toISOString() ?? s.createdAt.toISOString(),
  }));

  return (
    <DashboardShell role="SEEKER" current="/dashboard/saved">
      <SavedJobsClient jobs={jobs} />
    </DashboardShell>
  );
}
