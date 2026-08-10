import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Building2, Users, FileCheck, ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const DONUT_COLORS = ["#2563eb", "#7c3aed", "#f97316", "#10b981", "#a1a1aa"];

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  DRAFT:     "bg-zinc-100 text-zinc-600",
  CLOSED:    "bg-red-50 text-red-600",
};

const AVATAR_COLORS = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-orange-500", "bg-zinc-500"];

export default async function AdminHome() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "ADMIN") redirect(me.role === "EMPLOYER" ? "/employer" : "/dashboard");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const [
    jobsCount, companiesCount, usersCount, appsCount,
    jobsThisWeek, jobsPrevWeek,
    companiesThisWeek, companiesPrevWeek,
    usersThisWeek, usersPrevWeek,
    appsThisWeek, appsPrevWeek,
    recentJobs, recentApps, categories,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.company.count(),
    prisma.user.count(),
    prisma.application.count(),
    prisma.job.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.job.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.company.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.company.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.application.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      include: {
        company: { select: { name: true } },
        postedBy: { select: { name: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      include: { user: { select: { name: true } }, job: { select: { title: true } } },
    }),
    prisma.category.findMany({
      include: { _count: { select: { jobs: true } } },
      orderBy: { jobs: { _count: "desc" } },
    }),
  ]);

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const stats = [
    { label: "Total Jobs",     value: jobsCount,      pct: pctChange(jobsThisWeek, jobsPrevWeek),           icon: Briefcase, bg: "bg-blue-50",    color: "text-blue-600" },
    { label: "Companies",      value: companiesCount, pct: pctChange(companiesThisWeek, companiesPrevWeek), icon: Building2, bg: "bg-violet-50",  color: "text-violet-600" },
    { label: "Users",          value: usersCount,     pct: pctChange(usersThisWeek, usersPrevWeek),         icon: Users,     bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Applications",   value: appsCount,      pct: pctChange(appsThisWeek, appsPrevWeek),           icon: FileCheck, bg: "bg-orange-50",  color: "text-orange-500" },
  ];

  // Jobs posted per day, last 7 days
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const count = await prisma.job.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } });
    days.push({ label: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count });
  }
  const maxCount = Math.max(1, ...days.map(d => d.count));
  const chartW = 600, chartH = 180, padX = 20, padY = 10;
  const stepX = (chartW - padX * 2) / (days.length - 1);
  const points = days.map((d, i) => {
    const x = padX + i * stepX;
    const y = chartH - padY - (d.count / maxCount) * (chartH - padY * 2);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `${padX},${chartH - padY} ${points} ${chartW - padX},${chartH - padY}`;

  const totalCatJobs = categories.reduce((s, c) => s + c._count.jobs, 0) || 1;
  const topCats = categories.slice(0, 4);
  const othersCount = categories.slice(4).reduce((s, c) => s + c._count.jobs, 0);
  const donutSlices = [
    ...topCats.map(c => ({ label: c.name, count: c._count.jobs })),
    ...(othersCount > 0 ? [{ label: "Others", count: othersCount }] : []),
  ];

  let cumulative = 0;
  const circumference = 2 * Math.PI * 38;
  const donutSegments = donutSlices.map((s, i) => {
    const fraction = s.count / totalCatJobs;
    const dash = fraction * circumference;
    const offset = cumulative;
    cumulative += dash;
    return { ...s, dash, offset, color: DONUT_COLORS[i % DONUT_COLORS.length], pct: Math.round(fraction * 100) };
  });

  return (
    <DashboardShell role="ADMIN" current="/admin">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900">Welcome back, {me.name.split(" ")[0]}! 👋</h1>
          <p className="text-sm text-zinc-500 mt-1">Here&apos;s what&apos;s happening on your platform today.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, pct, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-900">{value.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 font-medium">{label}</div>
              <div className={`text-[11px] font-semibold mt-0.5 ${pct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}% vs last week
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Donut */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900">Jobs Overview</h2>
            <span className="text-xs font-semibold text-zinc-500">Last 7 Days</span>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44">
            <defs>
              <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#jobsGradient)" />
            <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {days.map((d, i) => {
              const x = padX + i * stepX;
              const y = chartH - padY - (d.count / maxCount) * (chartH - padY * 2);
              return <circle key={i} cx={x} cy={y} r="3.5" fill="#2563eb" />;
            })}
          </svg>
          <div className="flex justify-between mt-1 text-[11px] text-zinc-400 font-medium px-1">
            {days.map(d => <span key={d.label}>{d.label}</span>)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900">Top Job Categories</h2>
          </div>
          {donutSlices.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-10">No categories yet.</p>
          ) : (
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e4e4e7" strokeWidth="14" />
                  {donutSegments.map((s, i) => (
                    <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={s.color} strokeWidth="14"
                      strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                      strokeDashoffset={`${-s.offset}`}
                      transform="rotate(-90 50 50)" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-black text-zinc-900">{jobsCount}</div>
                  <div className="text-[10px] text-zinc-400">Total Jobs</div>
                </div>
              </div>
              <ul className="space-y-2 flex-1 min-w-0">
                {donutSegments.map(s => (
                  <li key={s.label} className="flex items-center justify-between text-xs gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="text-zinc-400 font-medium shrink-0">{s.count} ({s.pct}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent Job Postings + Recent Applications */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">Recent Job Postings</h2>
            <Link href="/admin/jobs" className="text-xs font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">No jobs posted yet.</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {recentJobs.map(j => (
                <Link key={j.id} href={`/admin/jobs/${j.id}/preview`} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-zinc-50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 text-sm truncate">{j.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{j.company.name} · by {j.postedBy.name} · {j._count.applications} applications</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[j.status] ?? STATUS_STYLE.DRAFT}`}>
                    {j.status.toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">Recent Applications</h2>
            <Link href="/admin/jobs" className="text-xs font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">No applications yet.</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {recentApps.map((a, i) => {
                const initials = a.user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={a.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-zinc-50 transition-colors">
                    <div className={`h-9 w-9 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 text-sm truncate">{a.user.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{a.job.title}</div>
                    </div>
                    <div className="text-[11px] text-zinc-400 shrink-0">{timeAgo(a.createdAt)}</div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
