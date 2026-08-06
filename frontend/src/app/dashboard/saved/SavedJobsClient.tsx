"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, Search, SlidersHorizontal, Briefcase, MapPin, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  company: string;
  logoUrl: string | null;
  slug: string;
  employmentType: string;
  location: string;
  savedAt: string;
  postedAt: string;
};

const LOGO_COLORS = [
  "bg-teal-700", "bg-emerald-700", "bg-blue-600", "bg-rose-600",
  "bg-violet-600", "bg-orange-600", "bg-indigo-600", "bg-pink-600",
];

export function SavedJobsClient({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<"recent" | "oldest">("recent");

  const list = jobs;

  const employmentTypes = Array.from(new Set(list.map(j => j.employmentType))).filter(Boolean);
  const locations = Array.from(new Set(list.map(j => j.location))).filter(Boolean);
  const activeFilterCount = (employmentType ? 1 : 0) + (location ? 1 : 0);

  const filtered = list
    .filter(j =>
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    )
    .filter(j => !employmentType || j.employmentType === employmentType)
    .filter(j => !location || j.location === location)
    .slice()
    .sort((a, b) => {
      const diff = new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      return sort === "recent" ? diff : -diff;
    });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
          <Bookmark className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">Saved Jobs</p>
          <h1 className="text-2xl font-black text-zinc-900">Jobs you&apos;ve saved</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Keep track of opportunities you&apos;re interested in and apply when you&apos;re ready.</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Count card */}
        <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bookmark className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-black text-zinc-900">{list.length}</div>
            <div className="text-xs font-semibold text-zinc-500">Saved Jobs</div>
            <div className="text-[11px] text-zinc-400">Jobs you&apos;ve bookmarked</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search saved jobs..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => { setFilterOpen(v => !v); setSortOpen(false); }}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 border border-zinc-200 bg-white px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filter
            {activeFilterCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
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

        <div className="relative shrink-0">
          <button
            onClick={() => { setSortOpen(v => !v); setFilterOpen(false); }}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 border border-zinc-200 bg-white px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> {sort === "recent" ? "Recently Saved" : "Oldest Saved"} ▾
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-11 z-10 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
              <button
                onClick={() => { setSort("recent"); setSortOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${sort === "recent" ? "text-blue-600 font-semibold" : "text-zinc-700"}`}
              >
                Recently Saved
              </button>
              <button
                onClick={() => { setSort("oldest"); setSortOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${sort === "oldest" ? "text-blue-600 font-semibold" : "text-zinc-700"}`}
              >
                Oldest Saved
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job list */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden" data-testid="saved-jobs-list">
        <div className="divide-y divide-zinc-50">
          {list.length === 0 ? (
            <div className="py-16 text-center">
              <Bookmark className="h-8 w-8 mx-auto text-zinc-200 mb-3" />
              <p className="text-sm font-semibold text-zinc-500">No saved jobs yet</p>
              <p className="text-sm text-zinc-400 mt-1">Save jobs you're interested in while browsing to see them here.</p>
              <Link href="/jobs" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:underline">
                Browse jobs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bookmark className="h-8 w-8 mx-auto text-zinc-200 mb-3" />
              <p className="text-sm text-zinc-400">No saved jobs found.</p>
            </div>
          ) : filtered.map((j, i) => {
            const initials = j.company.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
            const color = LOGO_COLORS[i % LOGO_COLORS.length];
            return (
              <div key={j.id} className="flex items-center gap-4 px-6 py-5 hover:bg-zinc-50 transition-colors" data-testid={`saved-${j.id}`}>
                {j.logoUrl ? (
                  <img src={j.logoUrl} alt="" className="h-14 w-14 rounded-xl object-contain border border-zinc-100 shrink-0" />
                ) : (
                  <div className={`h-14 w-14 rounded-xl ${color} flex items-center justify-center text-white font-bold text-base shrink-0`}>{initials}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-zinc-900 text-base">{j.title}</div>
                  <div className="text-sm font-semibold text-blue-600 mt-0.5">{j.company}</div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-zinc-400" />{j.employmentType}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-zinc-400" />{j.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-zinc-400" />Posted {timeAgo(j.postedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <button className="h-9 w-9 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition">
                      <Bookmark className="h-4 w-4 text-blue-600 fill-blue-600" />
                    </button>
                    <Link href={j.slug && j.slug !== "#" ? `/jobs/${j.slug}` : `/jobs?q=${encodeURIComponent(j.title)}`}
                      className="flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition">
                      View Job
                    </Link>
                  </div>
                  <div className="text-xs text-zinc-400">Saved {timeAgo(j.savedAt)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {list.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Showing 1 to {filtered.length} of {list.length} saved jobs</span>
            <div className="flex items-center gap-1">
              <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowLeft className="h-4 w-4" /></button>
              {[1, 2].map(n => (
                <button key={n} className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${n === 1 ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{n}</button>
              ))}
              <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
