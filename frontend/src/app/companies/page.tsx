import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, BadgeCheck, ShieldCheck, Users, Star, Lock, Briefcase } from "lucide-react";

const TRUST_BADGES = [
  { icon: ShieldCheck, color: "text-blue-600",   bg: "bg-blue-50",   label: "Verified",       desc: "All companies are manually verified" },
  { icon: Users,       color: "text-emerald-600", bg: "bg-emerald-50", label: "Active Hiring",  desc: "Real jobs from active teams" },
  { icon: Star,        color: "text-purple-600",  bg: "bg-purple-50",  label: "Top Companies",  desc: "High-growth & industry leaders" },
  { icon: Lock,        color: "text-orange-500",  bg: "bg-orange-50",  label: "Secure",         desc: "Your data is safe with us" },
];

const AVATAR_COLORS = [
  "bg-zinc-900", "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-orange-500", "bg-pink-500", "bg-teal-600", "bg-rose-600",
];

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 60,
    include: { _count: { select: { jobs: { where: { status: "PUBLISHED" } } } } },
  });

  return (
    <main className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-12 mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 justify-between">

          {/* Left — heading */}
          <div className="max-w-sm lg:max-w-md">
            <div className="text-xs tracking-[0.2em] uppercase text-blue-600 font-bold mb-4">
              Top Companies. Great Opportunities.
            </div>
            <h1 className="text-4xl font-black text-zinc-900 leading-[1.08]">
              <span className="whitespace-nowrap">Work with companies</span><br />
              building{" "}
              <span className="text-blue-600">
                the future.
              </span>
            </h1>
            <p className="mt-5 text-zinc-700 text-base leading-relaxed max-w-md">
              Explore verified, high-growth companies that trust Jobtake to hire senior, principal and leadership talent.
            </p>
          </div>

          {/* Right — trust badges */}
          <div className="flex items-start gap-3 shrink-0 flex-wrap">
            {TRUST_BADGES.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2 px-5 py-4 min-w-[110px] bg-white rounded-2xl border border-zinc-100 shadow-sm">
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-sm font-bold text-zinc-900">{label}</div>
                <div className="text-[11px] text-zinc-700 leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 bg-white border border-zinc-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search company name, industry or role"
              className="w-full text-sm outline-none text-zinc-700 placeholder:text-zinc-400 bg-transparent"
              readOnly
            />
          </div>
          <div className="h-px sm:h-auto sm:w-px bg-zinc-200" />
          <select className="text-sm text-zinc-700 px-4 py-2 outline-none bg-transparent cursor-pointer">
            <option>All Industries</option>
            <option>Technology</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Manufacturing</option>
          </select>
          <div className="hidden sm:block h-auto w-px bg-zinc-200" />
          <select className="text-sm text-zinc-700 px-4 py-2 outline-none bg-transparent cursor-pointer">
            <option>Company Size</option>
            <option>1–50</option>
            <option>51–200</option>
            <option>201–1000</option>
            <option>1000+</option>
          </select>
          <div className="hidden sm:block h-auto w-px bg-zinc-200" />
          <select className="text-sm text-zinc-700 px-4 py-2 outline-none bg-transparent cursor-pointer">
            <option>All Locations</option>
            <option>Remote</option>
            <option>Mumbai</option>
            <option>Bangalore</option>
            <option>Delhi</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap">
            Explore Companies →
          </button>
        </div>
      </section>

      {/* Companies grid */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Top companies hiring now</h2>
          <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
            View all companies →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c, i) => (
            <Link
              key={c.id}
              href={`/jobs?q=${encodeURIComponent(c.name)}`}
              className="flex items-start gap-4 p-5 rounded-2xl border border-zinc-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              {/* Logo */}
              {c.logoUrl ? (
                <img src={c.logoUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-contain border border-zinc-100 bg-white" />
              ) : (
                <div className={`h-14 w-14 shrink-0 rounded-2xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xl font-black`}>
                  {c.name[0]}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900 text-sm truncate">{c.name}</span>
                  <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                </div>
                {c.tagline && (
                  <p className="text-xs text-zinc-700 mt-0.5 line-clamp-2 leading-relaxed">{c.tagline}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-700">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {c._count.jobs} Open Role{c._count.jobs === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="h-8 w-8 rounded-full border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                <span className="text-zinc-400 group-hover:text-white text-sm">→</span>
              </div>
            </Link>
          ))}

          {!companies.length && (
            <div className="md:col-span-3 rounded-2xl border border-zinc-100 p-16 text-center text-zinc-700">
              <Building2 className="h-10 w-10 mx-auto text-zinc-300" />
              <div className="mt-4 text-lg font-bold text-zinc-900">No verified companies yet</div>
              <p className="text-sm text-zinc-700 mt-1">Check back soon — we're growing fast.</p>
            </div>
          )}
        </div>

        {/* Can't find company CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-100 rounded-2xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border-2 border-dashed border-zinc-300 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <div className="font-bold text-zinc-900">Can&apos;t find your company?</div>
              <div className="text-sm text-zinc-700">List it on Jobtake and reach top talent.</div>
            </div>
          </div>
          <Link
            href="/employers/login"
            className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-800 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white transition-colors whitespace-nowrap"
          >
            List your company →
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
