"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Loader2,
  MoreHorizontal,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";

type Row = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  location: string;
  company: string;
  companyLogoUrl: string | null;
  postedBy: string;
  applicants: number;
  createdAt: string;
  employmentType: string;
  workMode: string;
  collarType: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending Review",
  PUBLISHED: "Published",
  CLOSED: "Expired",
  REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  PENDING: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-rose-50 text-rose-600",
  REJECTED: "bg-red-50 text-red-600",
};

const COMPANY_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-400",
  "bg-slate-700",
  "bg-indigo-700",
];

const TYPE_STYLES: Record<string, string> = {
  FULL_TIME: "bg-blue-50 text-blue-700",
  PART_TIME: "bg-orange-50 text-orange-700",
  CONTRACT: "bg-violet-50 text-violet-700",
  INTERNSHIP: "bg-emerald-50 text-emerald-700",
  TEMPORARY: "bg-zinc-100 text-zinc-700",
  REMOTE: "bg-fuchsia-50 text-fuchsia-700",
  HYBRID: "bg-cyan-50 text-cyan-700",
  ONSITE: "bg-slate-100 text-slate-700",
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getJobType(job: Row) {
  return job.workMode === "REMOTE" ? "REMOTE" : job.employmentType;
}

export function AdminJobsTable({ jobs }: { jobs: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [jobType, setJobType] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const locations = useMemo(() => {
    return Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))).sort();
  }, [jobs]);

  const jobTypes = useMemo(() => {
    return Array.from(new Set(jobs.map(getJobType))).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.postedBy.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      const matchesStatus = status === "ALL" || job.status === status;
      const matchesType = jobType === "ALL" || getJobType(job) === jobType;
      const matchesLocation = location === "ALL" || job.location === location;
      const matchesFeatured = !featuredOnly || job.featured;

      return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesFeatured;
    });
  }, [featuredOnly, jobType, jobs, location, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedJobs = filteredJobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function patch(id: string, body: object) {
    setBusy(id);
    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setBusy(id);
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  async function share(job: Row) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    await navigator.clipboard?.writeText(`${origin}/jobs/${job.slug}`);
  }

  function exportCsv() {
    const header = ["Title", "Company", "Posted By", "Job Type", "Status", "Applicants", "Posted On", "Location"];
    const rows = filteredJobs.map((job) => [
      job.title,
      job.company,
      job.postedBy,
      humanize(getJobType(job)),
      STATUS_LABELS[job.status] ?? humanize(job.status),
      String(job.applicants),
      formatDate(job.createdAt),
      job.location,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-jobs.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetToFirstPage(valueSetter: (value: string) => void, value: string) {
    valueSetter(value);
    setPage(1);
  }

  return (
    <section className="min-w-0 space-y-5" data-testid="admin-jobs-table">
      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_150px_150px_160px_auto_auto] xl:items-end">
          <label className="block">
            <span className="text-xs font-semibold text-zinc-500">Search</span>
            <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                placeholder="Search jobs by title, company, keyword..."
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-zinc-500">Status</span>
            <select
              value={status}
              onChange={(event) => resetToFirstPage(setStatus, event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none"
            >
              <option value="ALL">All Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-zinc-500">Job Type</span>
            <select
              value={jobType}
              onChange={(event) => resetToFirstPage(setJobType, event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none"
            >
              <option value="ALL">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {humanize(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-zinc-500">Location</span>
            <select
              value={location}
              onChange={(event) => resetToFirstPage(setLocation, event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none"
            >
              <option value="ALL">All Locations</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setFeaturedOnly((value) => !value);
              setPage(1);
            }}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              featuredOnly
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-zinc-100 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-4 py-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" aria-label="Select all jobs" />
                </th>
                <th className="px-4 py-4">Job Title</th>
                <th className="px-4 py-4">Company / Posted By</th>
                <th className="px-4 py-4">Job Type</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-3 py-4">Applicants</th>
                <th className="px-3 py-4">Posted On</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {pagedJobs.map((job, index) => {
                const type = getJobType(job);
                const companyInitial = job.company.charAt(0).toUpperCase();

                return (
                  <tr key={job.id} className="hover:bg-zinc-50/70" data-testid={`admin-job-${job.id}`}>
                    <td className="px-4 py-4 align-middle">
                      <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" aria-label={`Select ${job.title}`} />
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <Link href={`/admin/jobs/${job.id}/preview`} className="flex items-start gap-3 group">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        <div className="min-w-0">
                          <div className="truncate font-bold text-zinc-950 group-hover:text-blue-700 group-hover:underline">{job.title}</div>
                          <div className="mt-0.5 truncate text-xs text-zinc-500">{job.location}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt="" className="h-6 w-6 shrink-0 rounded-md object-contain border border-zinc-100 bg-white" />
                        ) : (
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${COMPANY_COLORS[index % COMPANY_COLORS.length]}`}>
                            {companyInitial}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-zinc-700">{job.company}</div>
                          <div className="truncate text-xs text-zinc-400">by {job.postedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <span className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_STYLES[type] ?? TYPE_STYLES.TEMPORARY}`}>
                        {humanize(type)}
                      </span>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <span className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[job.status] ?? STATUS_STYLES.DRAFT}`}>
                        {STATUS_LABELS[job.status] ?? humanize(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center gap-2 text-zinc-700">
                        <Users className="h-4 w-4 text-zinc-500" />
                        <span className="font-semibold">{job.applicants}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle text-zinc-600">{formatDate(job.createdAt)}</td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        {busy === job.id && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                        <button
                          type="button"
                          onClick={() => patch(job.id, { status: "PUBLISHED" })}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-700 transition hover:bg-blue-50"
                          data-testid={`approve-${job.id}`}
                          title="Publish"
                          aria-label={`Publish ${job.title}`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(job.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50"
                          title="Remove"
                          aria-label={`Remove ${job.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => share(job)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-700 transition hover:bg-blue-50"
                          title="Share"
                          aria-label={`Share ${job.title}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <details className="relative">
                          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </summary>
                          <div className="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() => patch(job.id, { featured: !job.featured })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                              data-testid={`feature-${job.id}`}
                            >
                              <Flame className="h-3.5 w-3.5" />
                              {job.featured ? "Remove Hot" : "Hot Job"}
                            </button>
                            <button
                              type="button"
                              onClick={() => patch(job.id, { status: "DRAFT" })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              Move Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => patch(job.id, { status: "CLOSED" })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Mark Expired
                            </button>
                          </div>
                        </details>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!pagedJobs.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm font-medium text-zinc-500">
                    No jobs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <div>
          Showing {filteredJobs.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredJobs.length)} of {filteredJobs.length} jobs
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
                safePage === pageNumber
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1 text-zinc-400">...</span>}
          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold ${
                safePage === totalPages
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {totalPages}
            </button>
          )}
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="ml-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600">
            10 / page
          </div>
        </div>
      </div>
    </section>
  );
}
