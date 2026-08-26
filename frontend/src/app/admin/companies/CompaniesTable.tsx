"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Building2, ShieldCheck, Clock, Star, Briefcase,
  X, Loader2, ExternalLink, MapPin, Users as UsersIcon, Mail, Phone,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Company = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  size: string | null;
  headquarters: string | null;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  verified: boolean;
  featured: boolean;
  createdAt: string;
  jobsCount: number;
  owner: { name: string; email: string; phone: string | null };
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-600",
};

const AVATAR_COLORS = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-orange-500", "bg-rose-500", "bg-indigo-600"];

export function CompaniesTable({
  companies,
  stats,
}: {
  companies: Company[];
  stats: { totalCompanies: number; activeCompanies: number; pendingCompanies: number; verifiedCompanies: number; featuredCompanies: number };
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [selected, setSelected] = useState<Company | null>(companies[0] ?? null);
  const [busy, setBusy] = useState(false);

  const industries = useMemo(() => Array.from(new Set(companies.map(c => c.industry).filter(Boolean))) as string[], [companies]);

  const filtered = companies.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (industryFilter && c.industry !== industryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.owner.email.toLowerCase().includes(q) && !(c.industry ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  async function patch(id: string, body: object) {
    setBusy(true);
    await fetch(`/api/admin/companies/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-5">
      {/* ── LEFT ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-zinc-900">Company Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage all companies registered on the platform.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Companies", value: stats.totalCompanies,    icon: Building2,   bg: "bg-blue-50",    color: "text-blue-600",    sub: "All registered companies" },
            { label: "Active",          value: stats.activeCompanies,   icon: ShieldCheck, bg: "bg-emerald-50", color: "text-emerald-600", sub: "Currently active" },
            { label: "Pending",         value: stats.pendingCompanies,  icon: Clock,       bg: "bg-amber-50",   color: "text-amber-600",   sub: "Awaiting approval" },
            { label: "Verified",        value: stats.verifiedCompanies, icon: ShieldCheck, bg: "bg-violet-50",  color: "text-violet-600",  sub: "Verified companies" },
            { label: "Featured",        value: stats.featuredCompanies, icon: Star,        bg: "bg-rose-50",    color: "text-rose-600",    sub: "Featured on homepage" },
          ].map(({ label, value, icon: Icon, bg, color, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
              <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-xl font-black text-zinc-900">{value}</div>
              <div className="text-xs font-semibold text-zinc-600 mt-0.5">{label}</div>
              <div className="text-[10px] text-zinc-400">{sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies by name, email or industry..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400">
            <option value="">All Industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[720px]">
          <div className="grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50 text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-semibold">
            <div>Company</div>
            <div>Owner</div>
            <div>Industry</div>
            <div>Status</div>
            <div>Jobs</div>
          </div>
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-sm text-zinc-400">No companies match your filters.</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map((c, i) => {
                const initials = c.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                const isSelected = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr] gap-4 items-center px-6 py-3.5 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-zinc-50"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt="" className="h-10 w-10 rounded-xl object-contain border border-zinc-100 shrink-0" />
                      ) : (
                        <div className={`h-10 w-10 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-xs shrink-0`}>{initials}</div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 text-sm truncate flex items-center gap-1.5">
                          {c.name}
                          {c.verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                          {c.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">{timeAgo(c.createdAt)}</div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-700 truncate">{c.owner.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{c.owner.email}</div>
                    </div>
                    <div className="text-sm text-zinc-600 truncate">{c.industry ?? "—"}</div>
                    <div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[c.status]}`}>{c.status.toLowerCase()}</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-700">{c.jobsCount}</div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
          </div>
          <div className="px-6 py-3 border-t border-zinc-100 text-xs text-zinc-400">
            Showing {filtered.length} of {companies.length} companies
          </div>
        </div>
      </div>

      {/* ── RIGHT — Detail panel ── */}
      {selected && (
        <div className="hidden xl:block w-[340px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sticky top-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selected.logoUrl ? (
                  <img src={selected.logoUrl} alt="" className="h-12 w-12 rounded-xl object-contain border border-zinc-100" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                    {selected.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-zinc-900 text-sm">{selected.name}</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status]}`}>{selected.status.toLowerCase()}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link href={`/jobs?q=${encodeURIComponent(selected.name)}`} className="flex items-center justify-center gap-1.5 border border-zinc-200 rounded-lg py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                <ExternalLink className="h-3.5 w-3.5" /> View Jobs
              </Link>
              <button
                disabled={busy}
                onClick={() => patch(selected.id, { verified: !selected.verified })}
                className="flex items-center justify-center gap-1.5 border border-zinc-200 rounded-lg py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />} {selected.verified ? "Unverify" : "Verify"}
              </button>
              <button
                disabled={busy}
                onClick={() => patch(selected.id, { featured: !selected.featured })}
                className="flex items-center justify-center gap-1.5 border border-zinc-200 rounded-lg py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" /> {selected.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                disabled={busy}
                onClick={() => patch(selected.id, { status: selected.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" })}
                className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-semibold disabled:opacity-50 ${selected.status === "SUSPENDED" ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}
              >
                {selected.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
              </button>
            </div>

            {/* Info */}
            <div className="mt-5">
              <div className="text-xs font-bold text-zinc-900 mb-2">Company Information</div>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Industry</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.industry ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400 flex items-center gap-1.5"><UsersIcon className="h-3.5 w-3.5" /> Size</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.size ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> HQ</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.headquarters ?? "—"}</dd>
                </div>
              </dl>
            </div>

            {/* Owner */}
            <div className="mt-5">
              <div className="text-xs font-bold text-zinc-900 mb-2">Account Owner</div>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400">Name</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.owner.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.owner.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</dt>
                  <dd className="text-zinc-700 font-medium truncate">{selected.owner.phone ?? "—"}</dd>
                </div>
              </dl>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-zinc-900">{selected.jobsCount}</div>
                <div className="text-[10px] text-zinc-500">Jobs Posted</div>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-zinc-900">{timeAgo(selected.createdAt)}</div>
                <div className="text-[10px] text-zinc-500">Joined</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
