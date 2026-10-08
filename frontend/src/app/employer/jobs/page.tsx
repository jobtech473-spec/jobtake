import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Briefcase, Send, Eye, Bookmark, MapPin, Globe } from "lucide-react";
import { JobRowActions } from "./JobRowActions";
import { StopPropagation } from "@/components/StopPropagation";

// Shared by header and rows. Each row is its own grid, so text columns use
// minmax(0, …) — plain `fr` would grow to fit long text and misalign rows.
const ROW_COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_120px_100px_90px_80px]";

export default async function EmployerJobsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") redirect("/employers/login");

  const jobsRaw = await prisma.job.findMany({
    where: { postedById: me.id },
    orderBy: { createdAt: "desc" },
    include: {
      applications: { select: { stage: true, createdAt: true } },
      company: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const NEW_WINDOW_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();
  const jobs = jobsRaw.map(j => ({
    ...j,
    totalResponses: j.applications.length,
    newResponses: j.applications.filter(a => now - a.createdAt.getTime() < NEW_WINDOW_MS).length,
    shortlistedCount: j.applications.filter(a => a.stage === "SCREENING").length,
  }));

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === "PUBLISHED").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.totalResponses, 0);
  const shortlisted = jobs.reduce((sum, j) => sum + j.shortlistedCount, 0);

  return (
    <DashboardShell role="EMPLOYER" current="/employer/jobs">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">My Jobs</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage all your job postings in one place.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{totalJobs}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Jobs</div>
            <div className="text-[11px] text-zinc-400">All time</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Send className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{activeJobs}</div>
            <div className="text-xs text-zinc-500 font-medium">Active Jobs</div>
            <div className="text-[11px] text-zinc-400">Currently running</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{totalApplicants}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Applicants</div>
            <div className="text-[11px] text-zinc-400">Across all jobs</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Bookmark className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{shortlisted}</div>
            <div className="text-xs text-zinc-500 font-medium">Shortlisted</div>
            <div className="text-[11px] text-zinc-400">Across all jobs</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <div className="min-w-[760px]">
        {/* Table header row */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className={`grid ${ROW_COLS} items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold`}>
            <div>Job Title</div>
            <div>Location</div>
            <div>Total Responses</div>
            <div>Shortlisted</div>
            <div>Posted</div>
            <div className="text-right">Actions</div>
          </div>
        </div>

        {/* Rows */}
        {jobs.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            <Briefcase className="h-8 w-8 mx-auto text-zinc-300 mb-3" />
            No jobs posted yet.{" "}
            <Link href="/employer/post-job" className="text-blue-600 font-semibold hover:underline">Post your first job →</Link>
          </div>
        ) : (
          jobs.map((j, i) => (
            <Link
              key={j.id}
              href={`/employer/jobs/${j.id}/preview`}
              className={`px-6 py-4 grid ${ROW_COLS} items-center gap-4 hover:bg-zinc-50 transition-colors cursor-pointer ${i !== 0 ? "border-t border-zinc-100" : ""}`}
            >
              {/* Title */}
              <div className="min-w-0">
                <div className="font-semibold text-zinc-900 text-sm truncate">{j.title}</div>
                <div className="text-xs text-zinc-400 mt-0.5 truncate">{j.category?.name ?? "—"}</div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-sm text-zinc-600 min-w-0" title={j.location}>
                {j.workMode === "REMOTE" ? (
                  <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="truncate">
                  {j.location}
                  {j.workMode !== "ONSITE" && ` · ${j.workMode.charAt(0) + j.workMode.slice(1).toLowerCase()}`}
                </span>
              </div>

              {/* Total Responses */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-700 font-medium">{j.totalResponses}</span>
                {j.newResponses > 0 && (
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {j.newResponses} New
                  </span>
                )}
              </div>

              {/* Shortlisted */}
              <div className="text-sm text-zinc-700 font-medium">{j.shortlistedCount}</div>

              {/* Posted */}
              <div className="text-sm text-zinc-400 whitespace-nowrap">{timeAgo(j.createdAt)}</div>

              {/* Actions */}
              <StopPropagation>
                <div className="flex justify-end">
                  <JobRowActions jobId={j.id} jobTitle={j.title} />
                </div>
              </StopPropagation>
            </Link>
          ))
        )}
        </div>
        </div>

        {/* Footer */}
        {jobs.length > 0 && (
          <div className="px-6 py-3 border-t border-zinc-100 text-xs text-zinc-400">
            Showing 1 to {jobs.length} of {jobs.length} job{jobs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
