"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Bookmark, Eye, Send, Search, SlidersHorizontal,
  Building2, MapPin, Calendar, Clock, ChevronRight, ArrowRight, ArrowLeft,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

type App = {
  id: string;
  title: string;
  company: string;
  logoUrl: string | null;
  slug: string;
  employmentType: string;
  location: string;
  stage: string;
  matchScore: number | null;
  createdAt: string;
  updatedAt: string;
};

const STAGE_LABEL: Record<string, string> = {
  APPLIED:   "No Reply Yet",
  SCREENING: "In Review",
  INTERVIEW: "In Review",
  OFFER:     "Offer",
  HIRED:     "Hired",
  REJECTED:  "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STAGE_BADGE: Record<string, string> = {
  "In Review":    "bg-blue-50 text-blue-700",
  "No Reply Yet": "bg-amber-50 text-amber-700",
  "Offer":        "bg-emerald-50 text-emerald-700",
  "Hired":        "bg-emerald-100 text-emerald-800",
  "Rejected":     "bg-red-50 text-red-600",
  "Withdrawn":    "bg-zinc-100 text-zinc-500",
};

const STAGE_DESC: Record<string, string> = {
  APPLIED:   "Awaiting response",
  SCREENING: "Resume under review",
  INTERVIEW: "HR review in progress",
  OFFER:     "Offer received",
  HIRED:     "Congratulations!",
  REJECTED:  "Not selected",
  WITHDRAWN: "Withdrawn by you",
};

const NEXT_STEP: Record<string, string | null> = {
  APPLIED:   null,
  SCREENING: "Assessment",
  INTERVIEW: "Interview",
  OFFER:     "Decision",
  HIRED:     null,
  REJECTED:  null,
  WITHDRAWN: null,
};

const LOGO_COLORS = [
  "bg-teal-700", "bg-emerald-700", "bg-blue-600", "bg-rose-600",
  "bg-violet-600", "bg-orange-600", "bg-indigo-600", "bg-emerald-600",
];

type DemoApp = App & { appliedDate: string; nextStepDate: string | null };

type Tab = "All Applications" | "In Review" | "No Reply Yet" | "Archived";

export function ApplicationsClient({ applications, savedCount }: { applications: App[]; savedCount: number }) {
  const [tab, setTab] = useState<Tab>("All Applications");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");

  const rawList = applications.map(a => ({ ...a, appliedDate: new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), nextStepDate: NEXT_STEP[a.stage] ? "Upcoming" : null }));

  const inReviewCount   = rawList.filter(a => a.stage === "SCREENING" || a.stage === "INTERVIEW").length;
  const noReplyCount    = rawList.filter(a => a.stage === "APPLIED").length;

  const employmentTypes = Array.from(new Set(rawList.map(a => a.employmentType))).filter(Boolean);
  const locations = Array.from(new Set(rawList.map(a => a.location))).filter(Boolean);
  const activeFilterCount = (employmentType ? 1 : 0) + (location ? 1 : 0);

  const filtered = rawList.filter(a => {
    if (tab === "In Review"    && a.stage !== "SCREENING" && a.stage !== "INTERVIEW") return false;
    if (tab === "No Reply Yet" && a.stage !== "APPLIED") return false;
    if (tab === "Archived"     && a.stage !== "REJECTED" && a.stage !== "WITHDRAWN") return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (employmentType && a.employmentType !== employmentType) return false;
    if (location && a.location !== location) return false;
    return true;
  });

  const tabs: { label: Tab; count: number }[] = [
    { label: "All Applications", count: rawList.length },
    { label: "In Review",        count: inReviewCount },
    { label: "No Reply Yet",     count: noReplyCount },
    { label: "Archived",         count: 0 },
  ];

  return (
    <>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">My Applications</p>
        <h1 className="text-3xl font-black text-zinc-900 mt-1">Track your applications in one place</h1>
        <p className="text-sm text-zinc-500 mt-1">Stay updated on every opportunity you&apos;ve applied to.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Briefcase className="h-5 w-5 text-blue-600" />,  bg: "bg-blue-50",   value: rawList.length, label: "Jobs Applied",   sub: "View all applications →" },
          { icon: <Bookmark className="h-5 w-5 text-teal-600" />,   bg: "bg-teal-50",   value: savedCount,     label: "Saved Jobs",     sub: "Jobs you've saved" },
          { icon: <Eye className="h-5 w-5 text-violet-600" />,      bg: "bg-violet-50", value: inReviewCount,  label: "In Review",      sub: "Applications under review" },
          { icon: <Send className="h-5 w-5 text-orange-500" />,     bg: "bg-orange-50", value: noReplyCount,   label: "No Reply Yet",   sub: "Awaiting response" },
        ].map(({ icon, bg, value, label, sub }) => (
          <div key={label} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
            <div className="text-2xl font-black text-zinc-900">{value}</div>
            <div className="text-xs font-semibold text-zinc-600 mt-0.5">{label}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden" data-testid="applications-table">

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-6 pt-5">
          <div className="flex gap-0 border-b border-zinc-100 w-full sm:w-auto">
            {tabs.map(t => (
              <button key={t.label} onClick={() => setTab(t.label)}
                className={`text-sm font-semibold pb-3 pr-5 border-b-2 transition-colors whitespace-nowrap ${tab === t.label ? "text-blue-600 border-blue-600" : "text-zinc-400 border-transparent hover:text-zinc-600"}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tab === t.label ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-500"}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..."
                className="pl-8 pr-4 py-2 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-48" />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(v => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 border border-zinc-200 px-3 py-2 rounded-xl hover:bg-zinc-50 transition"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-10 w-64 rounded-xl border border-zinc-200 bg-white shadow-lg p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={e => setEmploymentType(e.target.value)}
                      className="mt-1.5 w-full text-sm border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-blue-400"
                    >
                      <option value="">All types</option>
                      {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Location</label>
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="mt-1.5 w-full text-sm border border-zinc-200 rounded-lg px-2.5 py-2 outline-none focus:border-blue-400"
                    >
                      <option value="">All locations</option>
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => { setEmploymentType(""); setLocation(""); }}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
                    >
                      Clear filters
                    </button>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
        <div className="min-w-[640px]">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50">
          {["Role / Company", "Applied On", "Status", "Next Step"].map(h => (
            <div key={h} className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-semibold">{h}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-zinc-200 mb-3" />
              <p className="text-sm text-zinc-400">
                {rawList.length === 0 ? "You haven't applied to any jobs yet." : "No applications match."}
              </p>
              {rawList.length === 0 && (
                <Link href="/jobs" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">Browse jobs →</Link>
              )}
            </div>
          ) : filtered.map((a, i) => {
            const initials = a.company.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
            const color = LOGO_COLORS[i % LOGO_COLORS.length];
            const label = STAGE_LABEL[a.stage] ?? a.stage;
            const badgeClass = STAGE_BADGE[label] ?? "bg-zinc-100 text-zinc-600";
            const desc = STAGE_DESC[a.stage] ?? "";
            const next = NEXT_STEP[a.stage];
            const nextDate = (a as DemoApp).nextStepDate ?? null;
            return (
              <Link href={`/jobs/${a.slug}`} key={a.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors items-center cursor-pointer" data-testid={`app-${a.id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {a.logoUrl ? (
                    <img src={a.logoUrl} alt="" className="h-11 w-11 rounded-xl object-contain border border-zinc-100 shrink-0" />
                  ) : (
                    <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{initials}</div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 text-sm truncate">{a.title}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.company}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{a.employmentType}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-700 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    {(a as DemoApp).appliedDate ?? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{timeAgo(a.createdAt)}</div>
                </div>

                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>{label}</span>
                  <div className="text-xs text-zinc-400 mt-1">{desc}</div>
                </div>

                <div className="flex items-center justify-between">
                  {next ? (
                    <div>
                      <div className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />{next}
                      </div>
                      {nextDate && <div className="text-xs text-zinc-400 mt-0.5">{nextDate}</div>}
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold text-zinc-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />No update yet
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">We&apos;ll notify you</div>
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-zinc-300 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
        </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Showing 1 to {filtered.length} of {rawList.length} applications</span>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowLeft className="h-4 w-4" /></button>
            {[1, 2, 3].map(n => (
              <button key={n} className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${n === 1 ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{n}</button>
            ))}
            <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </>
  );
}
