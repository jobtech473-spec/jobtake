"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Search, ChevronDown, Bookmark, BadgeCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Job = {
  id: string; slug: string; title: string; location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  seniority: string; experienceMin: number | null; experienceMax: number | null;
  salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  collarType: string | null;
  featured: boolean; publishedAt: string | null;
  company: { name: string; slug: string; logoUrl: string | null };
  category: { name: string; slug: string } | null;
  skills: string[];
};

type Cat = { id: string; name: string; slug: string };

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-orange-500", "bg-emerald-500",
  "bg-indigo-500", "bg-rose-500", "bg-teal-500", "bg-amber-500",
];

function formatSalaryINR(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

function formatExperience(min: number | null, max: number | null, fallback: string) {
  if (min !== null && max !== null) return `${min}-${max} yrs`;
  if (min !== null) return `${min}+ yrs`;
  if (max !== null) return `Up to ${max} yrs`;
  return fallback.charAt(0) + fallback.slice(1).toLowerCase();
}

export function JobsListClient({
  initialFilters, jobs, total, page, perPage, categories, initialSort,
}: {
  initialFilters: { q: string; location: string; category: string; workMode: string; seniority: string; collarType: string };
  jobs: Job[]; total: number; page: number; perPage: number; categories: Cat[]; initialSort: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startT] = useTransition();
  const [filters, setFilters] = useState(initialFilters);
  const [searchQ, setSearchQ] = useState(initialFilters.q);
  const [searchLoc, setSearchLoc] = useState(initialFilters.location);
  const [searchCat, setSearchCat] = useState(initialFilters.category);
  const [searchExp, setSearchExp] = useState(initialFilters.seniority);
  const [sortBy, setSortBy] = useState(initialSort);

  function changeSort(v: string) {
    setSortBy(v);
    const p = new URLSearchParams(sp);
    if (v && v !== "newest") p.set("sort", v); else p.delete("sort");
    p.delete("page");
    startT(() => router.push(`/jobs?${p.toString()}`));
  }

  function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams(sp);
    if (searchQ) p.set("q", searchQ); else p.delete("q");
    if (searchLoc) p.set("location", searchLoc); else p.delete("location");
    if (searchCat) p.set("category", searchCat); else p.delete("category");
    if (searchExp) p.set("seniority", searchExp); else p.delete("seniority");
    p.delete("page");
    startT(() => router.push(`/jobs?${p.toString()}`));
  }

  function applyFilters() {
    const p = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(filters)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    p.delete("page");
    startT(() => router.push(`/jobs?${p.toString()}`));
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={doSearch} className="mt-8 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label className="flex items-center gap-3 px-4 py-3.5 border-b md:border-b-0 md:border-r border-zinc-100 hover:bg-zinc-50 transition-colors">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Job title, company or skills"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
          <label className="flex items-center gap-3 px-4 py-3.5 border-b md:border-b-0 md:border-r border-zinc-100 hover:bg-zinc-50 transition-colors">
            <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              value={searchLoc}
              onChange={e => setSearchLoc(e.target.value)}
              placeholder="Location"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
          <label className="flex items-center gap-3 px-4 py-3.5 border-b md:border-b-0 md:border-r border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer">
            <Briefcase className="h-4 w-4 text-zinc-400 shrink-0" />
            <select
              value={searchCat}
              onChange={e => setSearchCat(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-500 outline-none appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
          </label>
          <label className="flex items-center gap-3 px-4 py-3.5 border-b md:border-b-0 md:border-r border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer">
            <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <select
              value={searchExp}
              onChange={e => setSearchExp(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-500 outline-none appearance-none"
            >
              <option value="">Any Experience</option>
              <option value="INTERN">Intern</option>
              <option value="ENTRY">Entry level</option>
              <option value="MID">Mid level</option>
              <option value="SENIOR">Senior</option>
              <option value="STAFF">Staff</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="DIRECTOR">Director</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
            <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
          </label>
          <div className="px-2 py-2 flex items-center">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition w-full whitespace-nowrap">
              Search Jobs
            </button>
          </div>
        </div>
      </form>

      {/* Main layout */}
      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-6">

        {/* Left sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 sticky top-28">
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-zinc-900 text-base">Filters</span>
              <button
                onClick={() => {
                  setFilters({ q: "", location: "", category: "", workMode: "", seniority: "", collarType: "" });
                  startT(() => router.push("/jobs"));
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    value={filters.location}
                    onChange={e => setFilters({ ...filters, location: e.target.value })}
                    placeholder="e.g. Mumbai, Delhi"
                    className="w-full pl-8 pr-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Category</label>
                <select
                  value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Experience</label>
                <select
                  value={filters.seniority}
                  onChange={e => setFilters({ ...filters, seniority: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition appearance-none bg-white"
                >
                  <option value="">Any Level</option>
                  <option value="INTERN">Intern</option>
                  <option value="ENTRY">Entry level</option>
                  <option value="MID">Mid level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="STAFF">Staff</option>
                  <option value="PRINCIPAL">Principal</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Job Type</label>
                <select
                  value={filters.workMode}
                  onChange={e => setFilters({ ...filters, workMode: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition appearance-none bg-white"
                >
                  <option value="">Any Type</option>
                  <option value="ONSITE">On-site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Collar Type</label>
                <select
                  value={filters.collarType}
                  onChange={e => setFilters({ ...filters, collarType: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="WHITE">White Collar</option>
                  <option value="BLUE">Blue Collar</option>
                  <option value="PINK">Pink Collar</option>
                  <option value="GREY">Grey Collar</option>
                  <option value="MSME">MSME</option>
                </select>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition mt-2"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        </aside>

        {/* Right — job list */}
        <div>
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-zinc-700">
              <span className="font-bold text-zinc-900">{total}</span> opportunities found
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => changeSort(e.target.value)}
                className="text-sm font-semibold text-zinc-700 bg-transparent outline-none border-0 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="relevant">Most Relevant</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
              <Search className="h-8 w-8 mx-auto text-zinc-300 mb-4" />
              <h3 className="font-semibold text-zinc-900 text-lg">No roles match those filters</h3>
              <p className="text-zinc-500 mt-1 text-sm">Try widening your search or clearing filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((j, i) => {
                const salary = formatSalaryINR(j.salaryMin, j.salaryMax);
                return (
                  <Link key={j.id} href={`/jobs/${j.slug}`} className="block bg-white rounded-2xl border border-zinc-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 p-5 group" data-testid={`job-card-${j.id}`}>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`h-12 w-12 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {j.company.name[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Title row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-zinc-900 text-base group-hover:text-blue-600 transition-colors leading-tight">
                                {j.title}
                              </h3>
                              {j.featured && (
                                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-600 border border-orange-200">
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Company + verified */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-sm text-zinc-500">{j.company.name}</span>
                              <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                            </div>

                            {/* Location / workMode / seniority */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />{j.location}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-zinc-300" />
                              <span className="capitalize">{j.workMode.toLowerCase()}</span>
                              <span className="h-1 w-1 rounded-full bg-zinc-300" />
                              <span>{formatExperience(j.experienceMin, j.experienceMax, j.seniority)}</span>
                            </div>

                            {/* Skills */}
                            {j.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {j.skills.map(s => (
                                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right: salary + time + bookmark */}
                          <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                            {salary && (
                              <span className="text-sm font-bold text-zinc-900">{salary}</span>
                            )}
                            {j.publishedAt && (
                              <span className="text-xs text-zinc-400">{timeAgo(j.publishedAt)}</span>
                            )}
                            <button
                              onClick={e => e.preventDefault()}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-blue-600 transition-colors"
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 10).map((p) => {
                const params = new URLSearchParams(sp);
                params.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/jobs?${params.toString()}`}
                    className={`h-9 min-w-9 px-3 rounded-lg grid place-items-center text-sm font-medium border transition ${
                      p === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
