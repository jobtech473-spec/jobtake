import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { UserActionsPanel } from "./UserActionsPanel";
import {
  ArrowLeft, Mail, Phone, MapPin, Clock, CheckCircle2, Zap,
  Briefcase, GraduationCap, FileText, Building2, Globe, Linkedin, Github,
} from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-600",
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN:    "bg-blue-50 text-blue-700",
  EMPLOYER: "bg-violet-50 text-violet-700",
  SEEKER:   "bg-teal-50 text-teal-700",
};

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }] },
      educations: { orderBy: { startYear: "desc" } },
      resumes: { orderBy: { createdAt: "desc" } },
      userSkills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
      ownedCompanies: { orderBy: { createdAt: "asc" }, include: { _count: { select: { jobs: true } } } },
      postedJobs: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, status: true, createdAt: true, slug: true } },
      _count: { select: { applications: true, savedJobs: true } },
    },
  });

  if (!user) notFound();

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <DashboardShell role="ADMIN" current="/admin/users">
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition mb-1">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <h1 className="text-2xl font-black text-zinc-900">User Profile</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* ── LEFT ── */}
        <div className="space-y-5">
          {/* Header card */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-4 flex-wrap">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-zinc-900">{user.name}</h2>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[user.role]}`}>{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[user.status]}`}>{user.status.toLowerCase()}</span>
                </div>
                {user.headline && <p className="text-sm text-zinc-500 mt-1">{user.headline}</p>}
                {user.bio && <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{user.bio}</p>}
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-zinc-600">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-zinc-400" /> {user.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {user.phone || "Not provided"}</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-zinc-400" /> {user.location || "Not provided"}</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-zinc-400" /> Joined {timeAgo(user.createdAt)}</div>
            </div>

            {(user.websiteUrl || user.linkedinUrl || user.githubUrl) && (
              <div className="mt-4 flex items-center gap-3">
                {user.websiteUrl && <a href={user.websiteUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Globe className="h-4 w-4" /></a>}
                {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Linkedin className="h-4 w-4" /></a>}
                {user.githubUrl && <a href={user.githubUrl} target="_blank" className="text-zinc-400 hover:text-zinc-700"><Github className="h-4 w-4" /></a>}
              </div>
            )}
          </div>

          {user.role === "SEEKER" && (
            <>
              {/* Skills */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Skills</h3>
                {user.userSkills.length === 0 ? (
                  <p className="text-sm text-zinc-400">No skills added.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.userSkills.map(us => (
                      <span key={us.skillId} className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">{us.skill.name}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-500" /> Experience</h3>
                {user.experiences.length === 0 ? (
                  <p className="text-sm text-zinc-400">No experience added.</p>
                ) : (
                  <div className="space-y-4">
                    {user.experiences.map(exp => (
                      <div key={exp.id}>
                        <div className="font-semibold text-zinc-900 text-sm">{exp.title}</div>
                        <div className="text-sm text-zinc-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {new Date(exp.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                        </div>
                        {exp.description && <p className="text-sm text-zinc-600 mt-1.5">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-violet-500" /> Education</h3>
                {user.educations.length === 0 ? (
                  <p className="text-sm text-zinc-400">No education added.</p>
                ) : (
                  <div className="space-y-4">
                    {user.educations.map(ed => (
                      <div key={ed.id}>
                        <div className="font-semibold text-zinc-900 text-sm">{ed.degree}{ed.field ? ` — ${ed.field}` : ""}</div>
                        <div className="text-sm text-zinc-500">{ed.school}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{ed.startYear} – {ed.endYear ?? "Present"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumes */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-rose-500" /> Resumes</h3>
                {user.resumes.length === 0 ? (
                  <p className="text-sm text-zinc-400">No resume uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {user.resumes.map(r => (
                      <a key={r.id} href={r.fileUrl} target="_blank" className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition text-sm">
                        <span className="text-zinc-700 font-medium truncate">{r.fileName}{r.isPrimary && <span className="ml-2 text-[10px] font-semibold text-blue-600">PRIMARY</span>}</span>
                        <span className="text-zinc-400 text-xs shrink-0 ml-2">{(r.fileSize / 1024).toFixed(0)} KB</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {user.role === "EMPLOYER" && (
            <>
              {/* Companies */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-violet-500" /> Companies</h3>
                {user.ownedCompanies.length === 0 ? (
                  <p className="text-sm text-zinc-400">No company created.</p>
                ) : (
                  <div className="space-y-3">
                    {user.ownedCompanies.map(c => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-100">
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain border border-zinc-100" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white text-xs font-black">{c.name[0].toUpperCase()}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900 text-sm truncate">{c.name}</div>
                          <div className="text-xs text-zinc-400">{c.industry || "—"} · {c._count.jobs} jobs posted</div>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 shrink-0">{c.status.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent jobs posted */}
              <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-500" /> Recent Jobs Posted</h3>
                {user.postedJobs.length === 0 ? (
                  <p className="text-sm text-zinc-400">No jobs posted.</p>
                ) : (
                  <div className="space-y-2">
                    {user.postedJobs.map(j => (
                      <Link key={j.id} href={`/admin/jobs/${j.id}/preview`} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition text-sm">
                        <span className="text-zinc-700 font-medium truncate">{j.title}</span>
                        <span className="text-zinc-400 text-xs shrink-0 ml-2">{j.status.toLowerCase()} · {timeAgo(j.createdAt)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Account meta ── */}
        <div className="space-y-5">
          <UserActionsPanel userId={user.id} initialStatus={user.status} />

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 text-sm mb-4">Account</h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Email Verified</dt>
                <dd className={`font-medium ${user.emailVerified ? "text-emerald-600" : "text-zinc-400"}`}>{user.emailVerified ? "Verified" : "Not verified"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Last Login</dt>
                <dd className="text-zinc-700 font-medium">{user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Never"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">User ID</dt>
                <dd className="text-zinc-700 font-medium">{user.id.slice(0, 8).toUpperCase()}</dd>
              </div>
            </dl>
          </div>

          {user.role === "SEEKER" && (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-zinc-900 text-sm mb-4">Activity</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-zinc-900">{user._count.applications}</div>
                  <div className="text-[10px] text-zinc-500">Applications</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-zinc-900">{user._count.savedJobs}</div>
                  <div className="text-[10px] text-zinc-500">Saved Jobs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
