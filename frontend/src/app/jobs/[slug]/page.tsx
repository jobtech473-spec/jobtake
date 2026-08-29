import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { ApplyPanel } from "./ApplyPanel";
import { SaveJobButton } from "./SaveJobButton";
import { StickyApplyBar } from "./StickyApplyBar";
import { NavHider } from "@/components/NavHider";
import { RichText } from "@/components/RichText";
import { getCurrentUser } from "@/lib/auth";
import { formatEducationSpecialization, formatSalary, timeAgo } from "@/lib/utils";
import {
  MapPin, Briefcase, BadgeDollarSign, Building2,
  BadgeCheck, ArrowLeft, Share2,
  Star, Users, TrendingUp, ShieldCheck, GraduationCap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatExperienceRange(min: number | null, max: number | null, fallback: string) {
  if (min !== null && max !== null) return `${min}-${max} yrs`;
  if (min !== null) return `${min}+ yrs`;
  if (max !== null) return `Up to ${max} yrs`;
  return fallback;
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [job, me] = await Promise.all([
    prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
        category: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!job || job.status !== "PUBLISHED") notFound();

  let hasApplied = false;
  let isSaved = false;
  if (me) {
    const [dup, savedRow] = await Promise.all([
      prisma.application.findUnique({ where: { jobId_userId: { jobId: job.id, userId: me.id } } }),
      prisma.savedJob.findUnique({ where: { userId_jobId: { userId: me.id, jobId: job.id } } }),
    ]);
    hasApplied = !!dup;
    isSaved = !!savedRow;
  }

  const companyInitial = job.company.name[0].toUpperCase();
  const experienceLabel = formatExperienceRange(
    job.experienceMin,
    job.experienceMax,
    job.seniority === "INTERN" ? "0-1 yrs" : job.seniority === "ENTRY" ? "1-2 yrs" : job.seniority === "MID" ? "2-5 yrs" : job.seniority === "SENIOR" ? "5-8 yrs" : job.seniority === "STAFF" ? "8-12 yrs" : job.seniority === "PRINCIPAL" ? "12-15 yrs" : job.seniority === "DIRECTOR" ? "15-20 yrs" : job.seniority === "EXECUTIVE" ? "20+ yrs" : job.seniority
  );
  const educationSpecializationText = formatEducationSpecialization(job.educationSpecialization);

  return (
    <main className="min-h-screen bg-white">
      <PublicNav />
      <NavHider />
      <div className="pt-28 pb-32 mx-auto max-w-6xl px-6 md:px-12">

        {/* Back link */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-800 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">

          {/* ── LEFT ── */}
          <div className="space-y-6">

            {/* Header card */}
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {job.category?.name && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    {job.category.name}
                  </span>
                )}
                {job.featured && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                    Featured
                  </span>
                )}
                {job.publishedAt && (
                  <span className="text-xs text-zinc-400">Posted {timeAgo(job.publishedAt)}</span>
                )}
              </div>

              {/* Title + actions */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 leading-tight flex items-center gap-3">
                  {job.title}
                  <BadgeCheck className="h-7 w-7 text-blue-500 shrink-0" />
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                  <SaveJobButton jobId={job.id} isLoggedIn={!!me} initialSaved={isSaved} />
                  <button className="h-9 w-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
                    <Share2 className="h-4 w-4 text-zinc-700" />
                  </button>
                </div>
              </div>

              {/* Company row */}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {companyInitial}
                </div>
                <span className="font-semibold text-zinc-800 text-sm">{job.company.name}</span>
                <BadgeCheck className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-zinc-400">★ 4.8 (323 reviews)</span>
              </div>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">
                    <MapPin className="h-3 w-3" /> Location
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{job.location} · {job.workMode.charAt(0) + job.workMode.slice(1).toLowerCase()}</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">
                    <Briefcase className="h-3 w-3" /> Work Mode
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{job.workMode.charAt(0) + job.workMode.slice(1).toLowerCase()}</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">
                    <BadgeDollarSign className="h-3 w-3" /> Salary
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{job.hideSalary ? "Not disclosed" : formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}</div>
                </div>
                {job.seniority && (
                  <div className="bg-zinc-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">
                      <TrendingUp className="h-3 w-3" /> Experience
                    </div>
                    <div className="text-sm font-bold text-zinc-900">
                      {experienceLabel}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About the role */}
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-6" data-testid="job-detail">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-zinc-900">About the role</h2>
                </div>
                <RichText value={job.description} className="text-zinc-700 text-sm leading-relaxed" />
              </section>

              {(job.responsibilities || job.requirements) && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-zinc-900">Roles and Responsibilities</h2>
                  </div>
                  {job.responsibilities && <RichText value={job.responsibilities} className="text-zinc-700 text-sm leading-relaxed" />}
                  {job.requirements && <RichText value={job.requirements} className="text-zinc-700 text-sm leading-relaxed mt-3" />}
                </section>
              )}

              {/* Job Details block — like reference image */}
              <section className="rounded-xl bg-zinc-50 border border-zinc-100 p-5 space-y-3">
                {job.category?.name && (
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-zinc-900 w-40 shrink-0">Role</span>
                    <span className="text-zinc-700">{job.category.name}</span>
                  </div>
                )}
                {job.company.industry && (
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-zinc-900 w-40 shrink-0">Industry Type</span>
                    <span className="text-zinc-700">{job.company.industry}</span>
                  </div>
                )}
                {job.collarType && (
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-zinc-900 w-40 shrink-0">Department</span>
                    <span className="text-zinc-700">
                      {job.collarType === "WHITE" ? "Corporate & Professional" : job.collarType === "BLUE" ? "Operations & Skilled Trades" : job.collarType === "PINK" ? "Service & Support" : job.collarType === "GREY" ? "Technical & Supervisory" : job.collarType === "MSME" ? "MSME & Entrepreneurship" : job.collarType}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 text-sm">
                  <span className="font-semibold text-zinc-900 w-40 shrink-0">Employment Type</span>
                  <span className="text-zinc-700">
                    {job.employmentType === "FULL_TIME" ? "Full Time, Permanent" : job.employmentType === "PART_TIME" ? "Part Time" : job.employmentType === "CONTRACT" ? "Contract" : job.employmentType === "INTERNSHIP" ? "Internship" : job.employmentType === "TEMPORARY" ? "Temporary" : job.employmentType}
                  </span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-semibold text-zinc-900 w-40 shrink-0">Work Mode</span>
                  <span className="text-zinc-700">
                    {job.workMode === "REMOTE" ? "Remote" : job.workMode === "ONSITE" ? "On-site" : job.workMode === "HYBRID" ? "Hybrid" : job.workMode}
                  </span>
                </div>
              </section>

              {job.minEducation.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-zinc-900">Education</h2>
                  </div>
                  <div className={`grid grid-cols-1 gap-x-10 gap-y-5 ${educationSpecializationText ? "md:grid-cols-2" : ""}`}>
                    <div>
                      <p className="text-sm font-bold text-zinc-400 mb-3">Minimum Education</p>
                      <div className="border-t border-zinc-100 pt-4 text-base font-medium text-zinc-800">
                        {job.minEducation.join(", ")}
                      </div>
                    </div>
                    {educationSpecializationText && (
                      <div>
                        <p className="text-sm font-bold text-zinc-400 mb-3">Specialization</p>
                        <div className="border-t border-zinc-100 pt-4 text-base font-medium text-zinc-800">
                          {educationSpecializationText}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {job.jobSkills.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-zinc-900 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.jobSkills.map(s => (
                      <span key={s.skill.id} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-4">

            {/* Apply panel */}
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-1">Apply for this role</h3>
              <p className="text-sm text-zinc-700 mb-4">
                {me
                  ? <>Apply for <span className="font-semibold text-zinc-900">{job.title}</span> in one click.</>
                  : <>Sign in or create an account to apply for <span className="font-semibold text-zinc-900">{job.title}</span></>}
              </p>
              <ApplyPanel jobId={job.id} jobTitle={job.title} userRole={me?.role || null} hasApplied={hasApplied} />
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 justify-center">
                <ShieldCheck className="h-3.5 w-3.5" /> Your data is safe and secure with us.
              </div>
            </div>

            {/* About the company */}
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-4">About the company</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black text-lg shrink-0">
                  {companyInitial}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-900 text-sm">{job.company.name}</span>
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  {job.company.tagline && <p className="text-xs text-zinc-700 mt-0.5">{job.company.tagline}</p>}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {job.company.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Industry</span>
                    <span className="font-semibold text-zinc-900">{job.company.industry}</span>
                  </div>
                )}
                {job.company.size && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700 flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Company size</span>
                    <span className="font-semibold text-zinc-900">{job.company.size} employees</span>
                  </div>
                )}
              </div>

              <Link
                href={`/jobs?q=${encodeURIComponent(job.company.name)}`}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-zinc-200 rounded-xl py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                View company profile →
              </Link>
            </div>

            {/* Similar roles */}
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-4">Similar roles</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                    {companyInitial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">Similar Position</div>
                    <div className="text-xs text-zinc-700">{job.company.name} · {job.location}</div>
                  </div>
                </div>
              </div>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                View more similar roles →
              </Link>
            </div>

          </aside>
        </div>
      </div>
      <StickyApplyBar
        jobTitle={job.title}
        companyName={job.company.name}
        location={job.location}
        slug={job.slug}
        isSeeker={me?.role === "SEEKER"}
        hasApplied={hasApplied}
      />
      <PublicFooter />
    </main>
  );
}
