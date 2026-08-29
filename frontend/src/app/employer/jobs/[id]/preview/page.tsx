import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatEducationSpecialization, formatSalary, timeAgo } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft, Pencil, MapPin, Briefcase, BadgeDollarSign,
  TrendingUp, BadgeCheck, Users, GraduationCap, Lightbulb,
  CheckCircle2, Building2, Clock, Calendar,
  Wifi, Monitor, Tag, Star, Linkedin, Facebook, Twitter, Mail, Link2,
} from "lucide-react";
import { PostJobButton } from "./PostJobButton";
import { RichText } from "@/components/RichText";

const SENIORITY_YRS: Record<string, string> = {
  INTERN: "0-1 yrs", ENTRY: "1-2 yrs", MID: "2-5 yrs", SENIOR: "5-8 yrs",
  STAFF: "8-12 yrs", PRINCIPAL: "12-15 yrs", DIRECTOR: "15-20 yrs", EXECUTIVE: "20+ yrs",
};
const SENIORITY_LABEL: Record<string, string> = {
  INTERN: "0-1 Years", ENTRY: "1-2 Years", MID: "2-5 Years", SENIOR: "3-5 Years",
  STAFF: "8-12 Years", PRINCIPAL: "12-15 Years", DIRECTOR: "15-20 Years", EXECUTIVE: "20+ Years",
};

function formatExperienceRange(min: number | null, max: number | null, fallback: string) {
  if (min !== null && max !== null) return `${min}-${max} Years`;
  if (min !== null) return `${min}+ Years`;
  if (max !== null) return `Up to ${max} Years`;
  return fallback;
}

export default async function JobPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") redirect("/employers/login");

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      category: true,
      jobSkills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job || job.company.ownerId !== me.id) notFound();

  const companyInitial = job.company.name[0].toUpperCase();
  const salaryLabel = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod);
  const empTypeLabel = job.employmentType === "FULL_TIME" ? "Full-time" : job.employmentType === "PART_TIME" ? "Part-time" : job.employmentType === "CONTRACT" ? "Contract" : job.employmentType === "INTERNSHIP" ? "Internship" : "Temporary";
  const workModeLabel = job.workMode === "REMOTE" ? "Remote" : job.workMode === "HYBRID" ? "Hybrid" : "On-site";
  const dept = job.collarType === "WHITE" ? "Corporate & Professional" : job.collarType === "BLUE" ? "Operations & Trades" : job.collarType === "PINK" ? "Service & Support" : job.collarType === "GREY" ? "Technical & Supervisory" : "MSME & Entrepreneurship";
  const experienceLabel = formatExperienceRange(job.experienceMin, job.experienceMax, SENIORITY_LABEL[job.seniority] ?? job.seniority);
  const educationSpecializationText = formatEducationSpecialization(job.educationSpecialization);

  return (
    <DashboardShell role="EMPLOYER" current="/employer/jobs">

      {/* Top bar */}
      <div className="mb-6">
        <div>
          <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition mb-1">
            <ArrowLeft className="h-4 w-4" /> Back to Edit Job
          </Link>
          <h1 className="text-2xl font-black text-zinc-900">Preview Your Job</h1>
          <p className="text-sm text-zinc-400 mt-0.5">This is how your job post will appear to candidates.</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 pb-24 lg:grid-cols-[1fr_280px]">

        {/* ── LEFT: Job Card Preview ── */}
        <div className="space-y-4">

          {/* Job Header Card */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            {/* Badge */}
            <div className="flex items-start gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                {empTypeLabel}
              </span>
            </div>

            <h2 className="text-2xl font-black text-zinc-900">{job.title}</h2>

            {/* Company row */}
            <div className="mt-2 flex items-center gap-2">
              {job.company.logoUrl ? (
                <img src={job.company.logoUrl} alt="" className="h-6 w-6 rounded object-contain border border-zinc-100" />
              ) : (
                <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-white text-xs font-black shrink-0">{companyInitial}</div>
              )}
              <span className="font-semibold text-zinc-800 text-sm">{job.company.name}</span>
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
              <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> {workModeLabel}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted on {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job._count.applications} applicants</span>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <TrendingUp className="h-4 w-4 text-blue-500" />, label: "Experience",       value: experienceLabel },
                { icon: <Briefcase className="h-4 w-4 text-blue-500" />,  label: "Employment Type", value: empTypeLabel },
                { icon: <Wifi className="h-4 w-4 text-blue-500" />,       label: "Work Mode",       value: workModeLabel },
                { icon: <Tag className="h-4 w-4 text-blue-500" />,        label: "Department",      value: job.category?.name ?? dept },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-zinc-50 rounded-xl p-3 flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="text-[11px] text-zinc-400 font-semibold">{label}</div>
                    <div className="text-xs font-bold text-zinc-900 mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About the Role */}
          {job.description && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">About the Role</h3>
              <RichText value={job.description} className="text-sm text-zinc-600 leading-relaxed" />
            </div>
          )}

          {/* Roles & Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">Roles &amp; Responsibilities</h3>
              <RichText value={job.responsibilities} className="text-sm text-zinc-600 leading-relaxed" />
            </div>
          )}

          {/* Job Requirements */}
          {job.requirements && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">Job Requirements</h3>
              <RichText value={job.requirements} className="text-sm text-zinc-600 leading-relaxed" />
            </div>
          )}

          {/* Education */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" /> Education
            </h3>
            {job.minEducation.length === 0 ? (
              <p className="text-sm text-zinc-400">Not specified</p>
            ) : (
              <div className={`grid grid-cols-1 gap-x-10 gap-y-5 ${educationSpecializationText ? "sm:grid-cols-2" : ""}`}>
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
            )}
          </div>

          {/* Job Details Grid */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                { icon: <Tag className="h-4 w-4 text-blue-500" />,         label: "Job Category",       value: job.category?.name ?? "—" },
                { icon: <BadgeDollarSign className="h-4 w-4 text-blue-500" />, label: "Salary Range",   value: salaryLabel || "Not specified" },
                { icon: <Wifi className="h-4 w-4 text-blue-500" />,        label: "Work Mode",          value: workModeLabel },
                ...(job.benefits ? [{ icon: <Star className="h-4 w-4 text-blue-500" />, label: "Additional Benefits", value: job.benefits }] : []),
                { icon: <MapPin className="h-4 w-4 text-blue-500" />,      label: "Job Location",       value: job.location },
                { icon: <Tag className="h-4 w-4 text-blue-500" />,         label: "Department",         value: dept },
                ...(job.workMode === "REMOTE" ? [{ icon: <Wifi className="h-4 w-4 text-blue-500" />, label: "Remote Job", value: "Available" }] : []),
                { icon: <Calendar className="h-4 w-4 text-blue-500" />,    label: "Posted On",          value: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                { icon: <TrendingUp className="h-4 w-4 text-blue-500" />,  label: "Experience Level",   value: experienceLabel },
                { icon: <Calendar className="h-4 w-4 text-blue-500" />,    label: "Application Deadline",value: "Not Specified" },
                { icon: <Briefcase className="h-4 w-4 text-blue-500" />,   label: "Employment Type",    value: empTypeLabel },
                { icon: <Briefcase className="h-4 w-4 text-blue-500" />,   label: "Job Type",           value: empTypeLabel },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="text-zinc-400 text-xs font-semibold">{label}</div>
                    <div className="text-zinc-800 font-medium mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {job.jobSkills.length > 0 && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.jobSkills.map(s => (
                  <span key={s.skill.id} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About Company */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 mb-4">About Company</h3>
            <div className="flex items-start gap-4">
              {job.company.logoUrl ? (
                <img src={job.company.logoUrl} alt="" className="h-14 w-14 rounded-xl object-contain border border-zinc-100 shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl shrink-0">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 text-base">{job.company.name}</span>
                  <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                </div>
                {job.company.description && (
                  <p className="text-sm text-zinc-600 mt-1 leading-relaxed line-clamp-3">{job.company.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                  {job.company.founded && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {job.company.founded}+ Years</span>}
                  {job.company.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.company.headquarters}</span>}
                </div>
                <a href={`/companies/${job.company.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                  View Company Profile →
                </a>
              </div>
            </div>
          </div>

          {/* Share this job */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700">Share this job</span>
            <div className="flex items-center gap-2">
              {[
                { icon: <Linkedin className="h-4 w-4" />, color: "text-blue-700 hover:bg-blue-50" },
                { icon: <Facebook className="h-4 w-4" />, color: "text-blue-600 hover:bg-blue-50" },
                { icon: <Twitter className="h-4 w-4" />,  color: "text-sky-500 hover:bg-sky-50" },
                { icon: <Mail className="h-4 w-4" />,     color: "text-zinc-600 hover:bg-zinc-100" },
                { icon: <Link2 className="h-4 w-4" />,    color: "text-zinc-600 hover:bg-zinc-100" },
              ].map(({ icon, color }, i) => (
                <button key={i} className={`h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center transition ${color}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-6 h-fit">

          {/* Job Summary */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4">Job Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Job Title",        value: job.title },
                { label: "Job Category",     value: job.category?.name },
                { label: "Location",         value: job.location },
                { label: "Employment Type",  value: empTypeLabel },
                { label: "Experience Level", value: experienceLabel },
                { label: "Work Mode",        value: workModeLabel },
                { label: "Education",        value: job.minEducation.length ? job.minEducation.join(", ") : undefined },
                { label: "Salary",           value: salaryLabel || "Not specified" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-zinc-400 font-semibold">{label}</div>
                  <div className="text-sm font-medium text-zinc-800 mt-0.5">{value ?? "—"}</div>
                </div>
              ))}
            </div>
            {job.status === "PUBLISHED" && (
              <Link href={`/jobs/${job.slug}`} target="_blank"
                className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
                <CheckCircle2 className="h-4 w-4" /> View Full Details
              </Link>
            )}
          </div>

          {/* Posting Tips */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Posting Tips
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {[
                "Use a clear and specific job title.",
                "Highlight key responsibilities in detail.",
                "Add must-have skills and qualifications.",
                "Include salary range to attract relevant candidates.",
                "Review before publishing to ensure accuracy.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3">
          <Link href={`/employer/jobs/${id}/edit`}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
            <Pencil className="h-4 w-4" /> Edit Job
          </Link>
          <PostJobButton jobId={id} status={job.status} />
        </div>
      </div>
    </DashboardShell>
  );
}
