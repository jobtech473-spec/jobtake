import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, Bookmark, Eye, Send, ArrowRight, ChevronRight,
  MapPin, Building2,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

const STAGE_STYLE: Record<string, string> = {
  APPLIED:   "bg-blue-50 text-blue-700",
  SCREENING: "bg-violet-50 text-violet-700",
  INTERVIEW: "bg-amber-50 text-amber-700",
  OFFER:     "bg-emerald-50 text-emerald-700",
  HIRED:     "bg-emerald-100 text-emerald-800",
  REJECTED:  "bg-red-50 text-red-600",
  WITHDRAWN: "bg-zinc-100 text-zinc-500",
};

const STAGE_LABEL: Record<string, string> = {
  APPLIED:   "Applied",
  SCREENING: "In Review",
  INTERVIEW: "Interview",
  OFFER:     "Offer",
  HIRED:     "Hired",
  REJECTED:  "Rejected",
  WITHDRAWN: "Withdrawn",
};

const LOGO_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-rose-500", "bg-emerald-600",
  "bg-orange-500", "bg-teal-600", "bg-indigo-600", "bg-pink-500",
];

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function SeekerDashboard() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "SEEKER") redirect(me.role === "EMPLOYER" ? "/employer" : "/admin");

  const [applications, savedCount, recommendations] = await Promise.all([
    prisma.application.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { job: { include: { company: { select: { name: true, logoUrl: true } } } } },
    }),
    prisma.savedJob.count({ where: { userId: me.id } }),
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { company: { select: { name: true, logoUrl: true } } },
    }),
  ]);

  const inReview   = applications.filter(a => a.stage === "SCREENING" || a.stage === "INTERVIEW").length;
  const noReply    = applications.filter(a => a.stage === "APPLIED").length;

  const allTab   = applications;
  const reviewTab = applications.filter(a => a.stage === "SCREENING" || a.stage === "INTERVIEW");
  const noReplyTab = applications.filter(a => a.stage === "APPLIED");

  const firstName = me.name.split(" ")[0];

  return (
    <DashboardShell role="SEEKER" current="/dashboard">
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">

        {/* ── LEFT ── */}
        <div className="space-y-6">

          {/* Greeting */}
          <div>
            <p className="text-zinc-400 text-sm">{getHour()}! 👋</p>
            <h1 className="text-3xl font-black text-zinc-900 mt-0.5" data-testid="seeker-greeting">Welcome, {firstName}!</h1>
            <p className="text-zinc-500 text-sm mt-1">Here's an overview of your job search activity.</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Briefcase className="h-5 w-5 text-blue-600" />,  bg: "bg-blue-50",    value: applications.length, label: "Jobs Applied",   sub: "View all applications →", href: "/dashboard/applications" },
              { icon: <Bookmark className="h-5 w-5 text-teal-600" />,   bg: "bg-teal-50",    value: savedCount,          label: "Saved Jobs",     sub: "Jobs you've saved",       href: "/dashboard/saved" },
              { icon: <Eye className="h-5 w-5 text-violet-600" />,      bg: "bg-violet-50",  value: inReview,            label: "In Review",      sub: "Applications under review", href: "/dashboard/applications" },
              { icon: <Send className="h-5 w-5 text-orange-500" />,     bg: "bg-orange-50",  value: noReply,             label: "No Reply Yet",   sub: "Awaiting response",       href: "/dashboard/applications" },
            ].map(({ icon, bg, value, label, sub, href }) => (
              <Link key={label} href={href} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow block">
                <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
                <div className="text-2xl font-black text-zinc-900">{value}</div>
                <div className="text-xs font-semibold text-zinc-600 mt-0.5">{label}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>
              </Link>
            ))}
          </div>

          {/* My Applications */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <h2 className="font-bold text-zinc-900">My Applications</h2>
              <Link href="/dashboard/applications" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All Applications <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-zinc-100 px-6">
              {[
                { label: "All Applications", count: allTab.length },
                { label: "In Review",        count: reviewTab.length },
                { label: "No Reply Yet",     count: noReplyTab.length },
              ].map(({ label }, i) => (
                <div key={label} className={`text-sm font-semibold pb-3 pr-5 cursor-default ${i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-400"}`}>
                  {label}
                </div>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-50">
              {applications.length === 0 ? (
                <div className="py-12 text-center">
                  <Briefcase className="h-8 w-8 mx-auto text-zinc-200 mb-3" />
                  <p className="text-sm text-zinc-400">No applications yet.</p>
                  <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline mt-1 inline-block">Browse jobs →</Link>
                </div>
              ) : (
                applications.map((a, i) => {
                  const initial = a.job.company.name[0].toUpperCase();
                  const color = LOGO_COLORS[i % LOGO_COLORS.length];
                  const stageLabel = STAGE_LABEL[a.stage] ?? a.stage;
                  const stageStyle = STAGE_STYLE[a.stage] ?? "bg-zinc-100 text-zinc-600";
                  const isNoReply = a.stage === "APPLIED";
                  return (
                    <Link key={a.id} href={`/jobs/${a.job.slug}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
                      data-testid={`app-row-${a.id}`}>
                      {a.job.company.logoUrl ? (
                        <img src={a.job.company.logoUrl} alt="" className="h-11 w-11 rounded-xl object-contain border border-zinc-100 shrink-0" />
                      ) : (
                        <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{initial}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900 text-sm truncate">{a.job.title}</div>
                        <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {a.job.company.name}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {a.job.employmentType?.replace("_", "-") ?? "Full-time"}</span>
                          <span>·</span>
                          <span>Applied on {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${stageStyle}`}>
                          {isNoReply ? "No Reply Yet" : stageLabel}
                        </span>
                        <div className="text-xs text-zinc-400">
                          {isNoReply ? `Applied ${timeAgo(a.createdAt)}` : `Updated ${timeAgo(a.updatedAt ?? a.createdAt)}`}
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-300" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Browse CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-6">
            <div className="text-4xl shrink-0">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900">Find your next great opportunity</h3>
              <p className="text-sm text-zinc-500 mt-0.5">Thousands of new jobs are posted every day. Keep exploring and apply for the best ones.</p>
            </div>
            <Link href="/jobs" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5">

          {/* Recommended for You */}
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 mb-4">Recommended for You</h3>
            <div className="space-y-4">
              {recommendations.map((j, i) => {
                const color = LOGO_COLORS[i % LOGO_COLORS.length];
                return (
                  <Link key={j.id} href={`/jobs/${j.slug}`}
                    className="flex items-start gap-3 hover:bg-zinc-50 rounded-xl p-2 -mx-2 transition-colors"
                    data-testid={`rec-${j.id}`}>
                    {j.company.logoUrl ? (
                      <img src={j.company.logoUrl} alt="" className="h-9 w-9 rounded-lg object-contain border border-zinc-100 shrink-0" />
                    ) : (
                      <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                        {j.company.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">{j.title}</div>
                      <div className="text-xs text-zinc-500">{j.company.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {j.location}
                        {j.workMode && <><span>·</span> {j.workMode.charAt(0) + j.workMode.slice(1).toLowerCase()}</>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/jobs" className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
              View More Jobs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
