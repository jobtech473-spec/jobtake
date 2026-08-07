import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminJobsTable } from "./AdminJobsTable";
import {
  Archive,
  BriefcaseBusiness,
  Eye,
  Pause,
  Send,
} from "lucide-react";

const STAT_META = {
  total: {
    label: "Total Jobs",
    icon: BriefcaseBusiness,
    iconWrap: "bg-blue-50 text-blue-600",
    valueClass: "text-blue-600",
  },
  published: {
    label: "Published",
    icon: Send,
    iconWrap: "bg-emerald-50 text-emerald-600",
    valueClass: "text-emerald-600",
  },
  pending: {
    label: "Pending Review",
    icon: Eye,
    iconWrap: "bg-orange-50 text-orange-500",
    valueClass: "text-orange-500",
  },
  draft: {
    label: "Draft",
    icon: Pause,
    iconWrap: "bg-violet-50 text-violet-600",
    valueClass: "text-violet-600",
  },
  expired: {
    label: "Expired",
    icon: Archive,
    iconWrap: "bg-rose-50 text-rose-500",
    valueClass: "text-rose-500",
  },
};

export default async function AdminJobs() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      postedBy: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    take: 300,
  });

  const previousJobs = await prisma.job.findMany({
    where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    select: { status: true },
  });

  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const countCurrent = (status?: string) => {
    const source = jobs.filter((job) => new Date(job.createdAt) >= weekAgo);
    return status ? source.filter((job) => job.status === status).length : source.length;
  };
  const countPrevious = (status?: string) => {
    return status ? previousJobs.filter((job) => job.status === status).length : previousJobs.length;
  };

  const stats = [
    {
      ...STAT_META.total,
      value: jobs.length,
      change: pctChange(countCurrent(), countPrevious()),
    },
    {
      ...STAT_META.published,
      value: jobs.filter((job) => job.status === "PUBLISHED").length,
      change: pctChange(countCurrent("PUBLISHED"), countPrevious("PUBLISHED")),
    },
    {
      ...STAT_META.pending,
      value: jobs.filter((job) => job.status === "PENDING").length,
      change: pctChange(countCurrent("PENDING"), countPrevious("PENDING")),
    },
    {
      ...STAT_META.draft,
      value: jobs.filter((job) => job.status === "DRAFT").length,
      change: pctChange(countCurrent("DRAFT"), countPrevious("DRAFT")),
    },
    {
      ...STAT_META.expired,
      value: jobs.filter((job) => job.status === "CLOSED").length,
      change: pctChange(countCurrent("CLOSED"), countPrevious("CLOSED")),
    },
  ];

  return (
    <DashboardShell role="ADMIN" current="/admin/jobs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900">Jobs Management</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <span>Dashboard</span>
            <span className="text-zinc-300">•</span>
            <span className="font-medium text-zinc-700">Jobs</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, change, icon: Icon, iconWrap, valueClass }) => (
            <div key={label} className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className={`text-2xl font-black leading-tight ${valueClass}`}>{value.toLocaleString()}</div>
                  <div className="mt-1 text-xs font-semibold text-zinc-900">{label}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>vs last week</span>
                    <span className={`font-bold ${change >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AdminJobsTable jobs={jobs.map(j => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          status: j.status,
          featured: j.featured,
          location: j.location,
          company: j.company.name,
          postedBy: j.postedBy.name,
          applicants: j._count.applications,
          createdAt: j.createdAt.toISOString(),
          employmentType: j.employmentType,
          workMode: j.workMode,
          collarType: (j as any).collarType ?? "WHITE",
        }))} />
      </div>
    </DashboardShell>
  );
}
