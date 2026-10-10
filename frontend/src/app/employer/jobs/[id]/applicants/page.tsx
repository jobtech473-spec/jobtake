import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ApplicantsBoard } from "./ApplicantsBoard";
import { ArrowLeft, ExternalLink, MapPin, Briefcase, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect("/employers/login");
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          user: {
            select: {
              id: true, name: true, email: true, headline: true, location: true, phone: true, bio: true,
              avatarUrl: true, yearsExperience: true, noticePeriod: true, currentSalary: true, expectedSalary: true,
              preferredLocations: true,
              experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }], take: 2, select: { title: true, company: true, current: true } },
              educations: { orderBy: { startYear: "desc" }, take: 1, select: { degree: true, field: true, school: true } },
              userSkills: { orderBy: { skill: { name: "asc" } }, take: 8, select: { skill: { select: { name: true } } } },
            },
          },
          resume: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();
  if (me.role !== "ADMIN" && job.postedById !== me.id) redirect("/employer");

  const apps = job.applications.map(a => ({
    id: a.id,
    stage: a.stage,
    rating: a.rating,
    matchScore: a.matchScore,
    user: {
      ...a.user,
      skills: a.user.userSkills.map(us => us.skill.name),
    },
    resumeUrl: a.resume ? `/api/resumes/${a.resume.id}` : null,
    coverLetter: a.coverLetter,
    createdAt: a.createdAt.toISOString(),
  }));

  const total      = apps.length;
  const shortlisted = apps.filter(a => a.stage === "SCREENING").length;
  const interview  = apps.filter(a => a.stage === "INTERVIEW").length;
  const hired      = apps.filter(a => a.stage === "HIRED").length;
  const rejected   = apps.filter(a => a.stage === "REJECTED").length;

  return (
    <DashboardShell role={me.role === "ADMIN" ? "ADMIN" : "EMPLOYER"} current="/employer/jobs">

      {/* ── Job Header ── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to My Jobs
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">{job.title}</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.workMode?.charAt(0) + (job.workMode?.slice(1).toLowerCase() ?? "")}</span>
              {job.publishedAt && <>
                <span>·</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Posted on {new Date(job.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/employer/jobs/${id}/preview`}
              className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-50 transition">
              View Job Details <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-5 border-b border-zinc-100 -mb-6 overflow-x-auto">
          {[
            { label: "Applicants", count: total },
            { label: "Shortlisted", count: shortlisted },
            { label: "Interview", count: interview },
            { label: "Hired", count: hired },
            { label: "Rejected", count: rejected },
          ].map((t, i) => (
            <div key={t.label}
              className={`text-sm font-semibold pb-4 pr-6 border-b-2 whitespace-nowrap ${i === 0 ? "text-blue-600 border-blue-600" : "text-zinc-400 border-transparent"}`}>
              {t.label} {t.count > 0 && `(${t.count})`}
            </div>
          ))}
        </div>
      </div>

      <ApplicantsBoard applications={apps} jobId={id} jobTitle={job.title} />
    </DashboardShell>
  );
}
