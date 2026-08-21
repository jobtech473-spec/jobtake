import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Clock, Pencil, User,
  Zap, FileText, Settings, ExternalLink,
  CheckCircle2, GraduationCap, Briefcase,
} from "lucide-react";
import { ProfileTabsNav } from "@/components/profile/ProfileTabsNav";
import { AboutMeCard } from "@/components/profile/AboutMeCard";
import { SkillsManager } from "@/components/profile/SkillsManager";
import { ExperienceManager } from "@/components/profile/ExperienceManager";
import { EducationManager } from "@/components/profile/EducationManager";
import { ResumeManager } from "@/components/profile/ResumeManager";
import { getManagedOptions } from "@/lib/job-options";

type SP = Promise<{ tab?: string }>;

export default async function ProfilePage({ searchParams }: { searchParams: SP }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") redirect("/login");

  const sp = await searchParams;
  const tab = sp.tab || "overview";

  const [user, userSkills, experiences, educations, resumes, managedOptions] = await Promise.all([
    prisma.user.findUnique({ where: { id: me.id } }),
    prisma.userSkill.findMany({ where: { userId: me.id }, include: { skill: true }, orderBy: { skill: { name: "asc" } } }),
    prisma.experience.findMany({ where: { userId: me.id }, orderBy: [{ current: "desc" }, { startDate: "desc" }] }),
    prisma.education.findMany({ where: { userId: me.id }, orderBy: [{ startYear: "desc" }] }),
    prisma.resume.findMany({ where: { userId: me.id }, orderBy: { createdAt: "desc" } }),
    getManagedOptions(true, true),
  ]);
  if (!user) redirect("/login");

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const skillNames = userSkills.map(us => us.skill.name);

  const experiencesJson = JSON.parse(JSON.stringify(experiences));
  const educationsJson = JSON.parse(JSON.stringify(educations));
  const resumesJson = JSON.parse(JSON.stringify(resumes));

  return (
    <DashboardShell role="SEEKER" current="/dashboard/profile">

      {/* ── Profile Hero ── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">

            {/* Left — avatar + info */}
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black ring-4 ring-blue-100">
                  {initials}
                </div>
                <Link href="/dashboard/profile/edit" className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-zinc-200 shadow flex items-center justify-center hover:bg-zinc-50 transition">
                  <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                </Link>
              </div>

              {/* Name + meta */}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold mb-1">My Profile</p>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-zinc-900">{user.name}</h1>
                  <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-100" />
                </div>

                {/* Profile strength */}
                <div className="flex items-center gap-1.5 mt-1 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">Profile strength: Great</span>
                </div>

                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                  {user.headline || "Add a professional headline to tell employers what you do."}
                </p>

                {/* View Public Profile */}
                <Link href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline mt-3">
                  View Public Profile <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right — contact info + edit button */}
            <div className="flex flex-col items-end gap-3">
              <Link href="/dashboard/profile/edit" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Link>
              <div className="space-y-1.5 text-sm text-zinc-500">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-zinc-400" />{user.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-zinc-400" />{user.phone || "Not provided"}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-zinc-400" />{user.location || "Not provided"}</div>
                <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-zinc-400" />Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </div>

        <ProfileTabsNav active={tab} />
      </div>

      {tab === "skills" && (
        <div className="max-w-2xl">
          <SkillsManager initialSkills={skillNames} keywordOptions={managedOptions.KEYWORD} />
        </div>
      )}

      {tab === "experience" && (
        <div className="max-w-3xl">
          <ExperienceManager initialExperiences={experiencesJson} />
        </div>
      )}

      {tab === "education" && (
        <div className="max-w-3xl">
          <EducationManager initialEducations={educationsJson} />
        </div>
      )}

      {tab === "resume" && (
        <div className="max-w-xl">
          <ResumeManager initialResumes={resumesJson} />
        </div>
      )}

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── About Me ── */}
          <AboutMeCard bio={user.bio || ""} />

          {/* ── Top Skills ── */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-zinc-900 text-sm">Top Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillNames.length > 0 ? skillNames.slice(0, 10).map(s => (
                <span key={s} className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full">{s}</span>
              )) : (
                <p className="text-sm text-zinc-400">No skills added yet — add some to boost your profile.</p>
              )}
            </div>
            <Link href="/dashboard/profile?tab=skills" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">Manage Skills</Link>
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-blue-500" />
              <h3 className="font-bold text-zinc-900 text-sm">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: FileText,  label: "Edit Resume",      href: "/dashboard/profile?tab=resume" },
                { icon: User,      label: "Update Profile",   href: "/dashboard/profile/edit" },
                { icon: Zap,       label: "Manage Skills",    href: "/dashboard/profile?tab=skills" },
                { icon: Settings,  label: "Privacy Settings", href: "/dashboard/settings" },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-3 text-sm text-zinc-600 font-medium hover:text-blue-600 py-1.5 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-400" /> {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Experience Summary ── */}
          <ExperienceManager initialExperiences={experiencesJson} compact viewAllHref="/dashboard/profile?tab=experience" />

          {/* ── Education ── */}
          <EducationManager initialEducations={educationsJson} compact viewAllHref="/dashboard/profile?tab=education" />

          {/* ── Resume ── */}
          <ResumeManager initialResumes={resumesJson} compact />

        </div>
      )}
    </DashboardShell>
  );
}
