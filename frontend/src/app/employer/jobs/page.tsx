import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Send, Eye, Bookmark } from "lucide-react";
import { JobsTable } from "./JobsTable";

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

  const jobRows = jobs.map(j => ({
    id: j.id,
    title: j.title,
    location: j.location,
    workMode: j.workMode,
    status: j.status,
    collarType: (j as { collarType: string | null }).collarType,
    createdAt: j.createdAt.toISOString(),
    publishedAt: j.publishedAt ? j.publishedAt.toISOString() : null,
    category: j.category,
    totalResponses: j.totalResponses,
    newResponses: j.newResponses,
    shortlistedCount: j.shortlistedCount,
  }));

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
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm py-16 text-center text-zinc-500 text-sm">
          <Briefcase className="h-8 w-8 mx-auto text-zinc-300 mb-3" />
          No jobs posted yet.{" "}
          <Link href="/employer/post-job" className="text-blue-600 font-semibold hover:underline">Post your first job →</Link>
        </div>
      ) : (
        <JobsTable jobs={jobRows} employerName={me.name ?? "You"} />
      )}
    </DashboardShell>
  );
}
