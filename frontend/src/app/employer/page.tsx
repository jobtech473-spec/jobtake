import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import {
  Briefcase, Users, Eye, Bookmark, MapPin, Globe,
  ArrowRight, Building2,
} from "lucide-react";
import { JobRowActions } from "./jobs/JobRowActions";
import { StopPropagation } from "@/components/StopPropagation";

export default async function EmployerHome() {
  const me = await getCurrentUser();
  if (!me) redirect("/employers/login");
  if (me.role !== "EMPLOYER") redirect(me.role === "ADMIN" ? "/admin" : "/dashboard");

  const [jobs, applicationsCount, totalViews] = await Promise.all([
    prisma.job.findMany({
      where: { postedById: me.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { applications: true } },
        company: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.application.count({ where: { job: { postedById: me.id } } }),
    prisma.job.aggregate({ where: { postedById: me.id }, _sum: { viewsCount: true } }),
  ]);

  const activeJobs = jobs.filter(j => j.status === "PUBLISHED").length;
  const totalJobsCount = await prisma.job.count({ where: { postedById: me.id } });
  const profileViews = totalViews._sum.viewsCount ?? 0;

  const STATUS_STYLE: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING:   "bg-amber-50 text-amber-700 border border-amber-200",
    DRAFT:     "bg-zinc-100 text-zinc-500 border border-zinc-200",
    CLOSED:    "bg-red-50 text-red-600 border border-red-100",
  };
  const STATUS_LABEL: Record<string, string> = {
    PUBLISHED: "Active", PENDING: "Pending", DRAFT: "Draft", CLOSED: "Closed",
  };

  return (
    <DashboardShell role="EMPLOYER" current="/employer">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold mb-1">Overview</p>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900">Let&apos;s build your dream team today.</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage jobs, track applicants and hire top talent faster with Jobtake.</p>
          </div>
          <Link
            href="/employer/post-job"
            className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            data-testid="post-job-btn"
          >
            + Post a New Job
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Briefcase, color: "bg-blue-50", iconColor: "text-blue-600",   label: "Active Jobs",        value: activeJobs },
            { icon: Users,     color: "bg-teal-50",  iconColor: "text-teal-600",   label: "Total Applicants",   value: applicationsCount },
            { icon: Eye,       color: "bg-purple-50", iconColor: "text-purple-600", label: "Profile Views",      value: profileViews },
            { icon: Bookmark,  color: "bg-orange-50", iconColor: "text-orange-500", label: "Shortlisted",        value: 0 },
          ].map(({ icon: Icon, color, iconColor, label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="text-xs text-zinc-400 font-medium">{label}</div>
              <div className="text-3xl font-black text-zinc-900 mt-1">{value}</div>
              <div className="text-xs text-zinc-400 mt-1">No change from last 7 days</div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Recent Job Posts */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100">
              <h2 className="font-bold text-zinc-900 text-lg">Recent Job Posts</h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
            <div className="min-w-[640px]">
            {/* Table head */}
            <div className="px-6 py-3 grid grid-cols-[2fr_1.5fr_80px_90px_80px] gap-4 text-[11px] uppercase tracking-[0.16em] text-zinc-400 font-semibold border-b border-zinc-100">
              <div>Job Title</div>
              <div>Location</div>
              <div>Applicants</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {jobs.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">
                No jobs yet.{" "}
                <Link href="/employer/post-job" className="text-blue-600 font-semibold hover:underline">Post your first job →</Link>
              </div>
            ) : (
              jobs.map((j, i) => (
                <Link
                  key={j.id}
                  href={`/employer/jobs/${j.id}/preview`}
                  className={`px-6 py-4 grid grid-cols-[2fr_1.5fr_80px_90px_80px] gap-4 items-center hover:bg-zinc-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-zinc-100" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 text-sm truncate">{j.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 truncate">{j.category?.name ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 truncate">
                    {j.workMode === "REMOTE"
                      ? <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                      : <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-300" />}
                    <span className="truncate">{j.location}</span>
                  </div>
                  <div className="text-sm font-semibold text-zinc-700">{j._count.applications}</div>
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[j.status] ?? STATUS_STYLE.DRAFT}`}>
                      {STATUS_LABEL[j.status] ?? j.status}
                    </span>
                  </div>
                  <StopPropagation>
                    <JobRowActions jobId={j.id} jobTitle={j.title} compact />
                  </StopPropagation>
                </Link>
              ))
            )}
            </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 text-center">
              <Link href="/employer/jobs" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                View all jobs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Applicants Overview donut */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-4">Applicants Overview</h3>
              <div className="flex items-center gap-5">
                {/* Simple donut SVG */}
                <div className="relative shrink-0">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#e4e4e7" strokeWidth="14" />
                    {applicationsCount > 0 ? (
                      <>
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 38 * 0.33} ${2 * Math.PI * 38 * 0.67}`}
                          strokeDashoffset={`${2 * Math.PI * 38 * 0.25}`} />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 38 * 0.19} ${2 * Math.PI * 38 * 0.81}`}
                          strokeDashoffset={`${-2 * Math.PI * 38 * 0.08}`} />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 38 * 0.22} ${2 * Math.PI * 38 * 0.78}`}
                          strokeDashoffset={`${-2 * Math.PI * 38 * 0.27}`} />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 38 * 0.13} ${2 * Math.PI * 38 * 0.87}`}
                          strokeDashoffset={`${-2 * Math.PI * 38 * 0.49}`} />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#d1d5db" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 38 * 0.14} ${2 * Math.PI * 38 * 0.86}`}
                          strokeDashoffset={`${-2 * Math.PI * 38 * 0.62}`} />
                      </>
                    ) : null}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-black text-zinc-900">{applicationsCount}</div>
                    <div className="text-[10px] text-zinc-400">Total</div>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {[
                    { color: "bg-blue-500",   label: "New",         pct: 33 },
                    { color: "bg-emerald-500", label: "Shortlisted", pct: 19 },
                    { color: "bg-amber-400",   label: "Interview",   pct: 22 },
                    { color: "bg-violet-500",  label: "Offered",     pct: 13 },
                    { color: "bg-zinc-300",    label: "Rejected",    pct: 14 },
                  ].map(({ color, label, pct }) => (
                    <li key={label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} /> {label}
                      </span>
                      <span className="text-zinc-400 font-medium">{pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { icon: Briefcase,   label: "Manage Jobs",    href: "/employer/jobs" },
                  { icon: Users,       label: "View Applicants", href: "/employer/jobs" },
                  { icon: Building2,   label: "Company Profile", href: "/employer/company" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                      <Icon className="h-4 w-4 text-zinc-400" /> {label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
