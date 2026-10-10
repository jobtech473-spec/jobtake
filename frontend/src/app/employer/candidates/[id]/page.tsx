import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import {
  ArrowLeft, Mail, Phone, MapPin, Zap,
  Briefcase, GraduationCap, FileText, Globe, Linkedin, Github,
} from "lucide-react";
import { CandidateActionBar } from "./CandidateActionBar";

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "EMPLOYER" && me.role !== "ADMIN")) redirect("/employers/login");

  const { id } = await params;
  const { job: jobId } = await searchParams;
  const backHref = jobId ? `/employer/jobs/${jobId}/applicants` : "/employer/jobs";

  // An employer may only view a candidate who has applied to one of their own jobs.
  if (me.role !== "ADMIN") {
    const hasApplied = await prisma.application.findFirst({
      where: { userId: id, job: { postedById: me.id } },
      select: { id: true },
    });
    if (!hasApplied) notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id, role: "SEEKER" },
    include: {
      experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }] },
      educations: { orderBy: { startYear: "desc" } },
      resumes: { orderBy: { createdAt: "desc" } },
      userSkills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
    },
  });
  if (!user) notFound();

  const application = jobId
    ? await prisma.application.findFirst({
        where: { userId: id, jobId },
        select: { id: true, stage: true, createdAt: true },
      })
    : null;

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const currentExp = user.experiences.find(e => e.current) ?? user.experiences[0];
  const latestEdu = user.educations[0];
  const primaryResume = user.resumes.find(r => r.isPrimary) ?? user.resumes[0];
  // Collapse repeat uploads of the same file (newest first, since user.resumes is ordered by createdAt desc)
  const uniqueResumes = Array.from(new Map(user.resumes.map(r => [r.fileName, r])).values());

  return (
    <DashboardShell role={me.role === "ADMIN" ? "ADMIN" : "EMPLOYER"} current="/employer/jobs">
      <div className="mb-6">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-base text-zinc-500 hover:text-zinc-800 transition mb-1">
          <ArrowLeft className="h-5 w-5" /> Back to Applicants
        </Link>
        <h1 className="text-3xl font-black text-zinc-900">Candidate Profile</h1>
      </div>

      <div className="w-full space-y-5">
        {application && (
          <CandidateActionBar
            applicationId={application.id}
            initialStage={application.stage}
            email={user.email}
            phone={user.phone}
            resumeId={primaryResume?.id ?? null}
          />
        )}

        {/* Header card */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <div className="flex items-start gap-5 flex-wrap">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-2xl">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-[240px]">
              <h2 className="text-2xl font-black text-zinc-900">{user.name}</h2>
              {user.headline && <p className="text-base text-zinc-500 mt-1">{user.headline}</p>}
              {user.bio && <p className="text-base text-zinc-600 mt-2 leading-relaxed">{user.bio}</p>}
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3 text-base text-zinc-600">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-400" /> {user.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-400" /> {user.phone || "Not provided"}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-400" /> {user.location || "Not provided"}</div>
          </div>

          {(user.websiteUrl || user.linkedinUrl || user.githubUrl) && (
            <div className="mt-4 flex items-center gap-3">
              {user.websiteUrl && <a href={user.websiteUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Globe className="h-5 w-5" /></a>}
              {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Linkedin className="h-5 w-5" /></a>}
              {user.githubUrl && <a href={user.githubUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Github className="h-5 w-5" /></a>}
            </div>
          )}
        </div>

        {/* Candidate Details */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Candidate Details</h3>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Current Designation</span><span className="font-medium text-zinc-900 text-right">{currentExp?.title ?? "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Experience</span><span className="font-medium text-zinc-900 text-right">{user.yearsExperience != null ? `${user.yearsExperience} years` : "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Current Company</span><span className="font-medium text-zinc-900 text-right">{currentExp?.company ?? "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Current Salary</span><span className="font-medium text-zinc-900 text-right">{user.currentSalary != null ? `₹${user.currentSalary} Lac(s)` : "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Current Location</span><span className="font-medium text-zinc-900 text-right">{user.location ?? "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Expected Salary</span><span className="font-medium text-zinc-900 text-right">{user.expectedSalary != null ? `₹${user.expectedSalary} Lac(s)` : "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Latest Education</span><span className="font-medium text-zinc-900 text-right">{latestEdu?.degree ?? "—"}</span></div>
            <div className="flex justify-between gap-2"><span className="text-zinc-400">Notice Period</span><span className="font-medium text-zinc-900 text-right">{user.noticePeriod ?? "—"}</span></div>
            {application && (
              <div className="flex justify-between gap-2"><span className="text-zinc-400">Application Date</span><span className="font-medium text-zinc-900 text-right">{new Date(application.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            )}
          </div>
          {user.preferredLocations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-50">
              <div className="text-base text-zinc-400 mb-1.5">Preferred Locations</div>
              <div className="flex flex-wrap gap-1.5">
                {user.preferredLocations.map(l => (
                  <span key={l} className="text-sm font-medium bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Skills</h3>
          {user.userSkills.length === 0 ? (
            <p className="text-base text-zinc-400">No skills added.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.userSkills.map(us => (
                <span key={us.skillId} className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">{us.skill.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500" /> Work Experience</h3>
          {user.experiences.length === 0 ? (
            <p className="text-base text-zinc-400">No experience added.</p>
          ) : (
            <div className="space-y-4">
              {user.experiences.map((exp, i) => (
                <div key={exp.id} className={i !== 0 ? "pt-4 border-t border-zinc-50" : ""}>
                  <div className="font-bold text-zinc-900 text-base">
                    {exp.company}
                    {exp.current && <span className="ml-2 text-sm font-semibold text-emerald-600">(Current Employer)</span>}
                  </div>
                  <div className="text-base text-zinc-600 mt-0.5">
                    {exp.title} &nbsp;|&nbsp; {new Date(exp.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                  </div>
                  {exp.current && user.noticePeriod && (
                    <div className="text-sm text-zinc-400 mt-0.5">Notice period: {user.noticePeriod}</div>
                  )}
                  {exp.description && <p className="text-base text-zinc-600 mt-1.5">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-500" /> Education</h3>
          {user.educations.length === 0 ? (
            <p className="text-base text-zinc-400">No education added.</p>
          ) : (
            <div className="space-y-4">
              {user.educations.map(ed => (
                <div key={ed.id}>
                  <div className="font-semibold text-zinc-900 text-base">{ed.degree}{ed.field ? ` — ${ed.field}` : ""}</div>
                  <div className="text-base text-zinc-500">{ed.school}</div>
                  <div className="text-sm text-zinc-400 mt-0.5">{ed.startYear} – {ed.endYear ?? "Present"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumes */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-rose-500" /> Resumes</h3>
          {uniqueResumes.length === 0 ? (
            <p className="text-base text-zinc-400">No resume uploaded.</p>
          ) : (
            <div className="space-y-2">
              {uniqueResumes.map(r => (
                <a key={r.id} href={`/api/resumes/${r.id}`} target="_blank" className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition text-base">
                  <span className="text-zinc-700 font-medium truncate">{r.fileName}{r.isPrimary && <span className="ml-2 text-xs font-semibold text-blue-600">PRIMARY</span>}</span>
                  <span className="text-zinc-400 text-sm shrink-0 ml-2">{(r.fileSize / 1024).toFixed(0)} KB</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
