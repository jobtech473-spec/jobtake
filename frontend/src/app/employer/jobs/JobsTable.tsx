"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, Globe, RefreshCw, Loader2 } from "lucide-react";
import { JobRowActions } from "./JobRowActions";
import { StopPropagation } from "@/components/StopPropagation";

const ROW_COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_140px_100px_120px_110px]";

type JobRow = {
  id: string;
  title: string;
  location: string;
  workMode: string;
  status: string;
  collarType: string | null;
  createdAt: string;
  publishedAt: string | null;
  category: { name: string } | null;
  totalResponses: number;
  newResponses: number;
  shortlistedCount: number;
};

const STATUS_FILTERS = [
  { key: "ALL", label: "All Jobs" },
  { key: "PUBLISHED", label: "Active Jobs" },
  { key: "CLOSED", label: "Closed Jobs" },
  { key: "PENDING", label: "Pending Approval" },
  { key: "DRAFT", label: "Drafts" },
] as const;

export function JobsTable({ jobs, employerName }: { jobs: JobRow[]; employerName: string }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [closing, setClosing] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: jobs.length };
    for (const s of ["PUBLISHED", "CLOSED", "PENDING", "DRAFT"]) {
      c[s] = jobs.filter(j => j.status === s).length;
    }
    return c;
  }, [jobs]);

  const filtered = statusFilter === "ALL" ? jobs : jobs.filter(j => j.status === statusFilter);

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(j => j.id)));
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  async function handleCloseSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Close ${selected.size} selected job${selected.size > 1 ? "s" : ""}? They will stop accepting applicants.`)) return;
    setClosing(true);
    await Promise.all(
      Array.from(selected).map(id =>
        fetch(`/api/employer/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        })
      )
    );
    setClosing(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[200px_1fr] gap-5">
      {/* Status filter sidebar */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 h-fit">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold mb-3">Job Status</div>
        <div className="space-y-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setSelected(new Set()); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === f.key ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span>{f.label}</span>
              <span className="text-xs text-zinc-400">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Action bar */}
        <div className="px-6 py-3 border-b border-zinc-100 flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selected.size === filtered.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Select All
          </label>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition disabled:opacity-50">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
          {selected.size > 0 && (
            <button onClick={handleCloseSelected} disabled={closing}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition disabled:opacity-50">
              {closing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Close {selected.size} Selected
            </button>
          )}
          <span className="ml-auto text-xs text-zinc-400">
            {selected.size > 0 ? `${selected.size} selected` : `Showing ${filtered.length} of ${jobs.length} jobs`}
          </span>
        </div>

        <div className="overflow-x-auto">
        <div className="min-w-[860px]">
        {/* Header row */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className={`grid ${ROW_COLS} items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold pl-8`}>
            <div>Job Title</div>
            <div>Location</div>
            <div>Total Responses</div>
            <div>Shortlisted</div>
            <div>Posted</div>
            <div className="text-right">Actions</div>
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            <Briefcase className="h-8 w-8 mx-auto text-zinc-300 mb-3" />
            No jobs in this status.
          </div>
        ) : (
          filtered.map((j, i) => {
            const postedDate = j.publishedAt ?? j.createdAt;
            const formattedDate = new Date(postedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const jobCode = `JT-${j.id.slice(-6).toUpperCase()}`;
            const isChecked = selected.has(j.id);
            return (
              <div key={j.id} className={`flex items-start gap-2 px-6 py-4 hover:bg-zinc-50 transition-colors ${i !== 0 ? "border-t border-zinc-100" : ""}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOne(j.id)}
                  onClick={e => e.stopPropagation()}
                  className="h-4 w-4 mt-2 rounded border-zinc-300 shrink-0"
                />
                <Link href={`/employer/jobs/${j.id}/preview`} className="flex-1 min-w-0 cursor-pointer">
                  <div className={`grid ${ROW_COLS} items-center gap-4`}>
                    {/* Title */}
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 text-sm truncate">{j.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                        {j.category?.name ?? "—"}
                        {j.collarType === "PINK" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-100">Diversity Hiring</span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 min-w-0" title={j.location}>
                      {j.workMode === "REMOTE" ? (
                        <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      )}
                      <span className="truncate">
                        {j.location}
                        {j.workMode !== "ONSITE" && ` · ${j.workMode.charAt(0) + j.workMode.slice(1).toLowerCase()}`}
                      </span>
                    </div>

                    {/* Total Responses */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-700 font-medium">{j.totalResponses}</span>
                      {j.newResponses > 0 && (
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                          {j.newResponses} New
                        </span>
                      )}
                    </div>

                    {/* Shortlisted */}
                    <div className="text-sm text-zinc-700 font-medium">{j.shortlistedCount}</div>

                    {/* Posted */}
                    <div className="text-sm text-zinc-700 font-medium whitespace-nowrap">{formattedDate}</div>

                    {/* Actions */}
                    <StopPropagation>
                      <div className="flex justify-end">
                        <JobRowActions jobId={j.id} jobTitle={j.title} />
                      </div>
                    </StopPropagation>
                  </div>

                  {/* Meta line */}
                  <div className="mt-2 text-right text-[11px] text-zinc-400">
                    posted by {employerName} &nbsp;&middot;&nbsp; {jobCode} &nbsp;&middot;&nbsp; {formattedDate}
                  </div>
                </Link>
              </div>
            );
          })
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
