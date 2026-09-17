"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Users as UsersIcon, ShieldCheck, UserX, Building2, User as UserIcon,
  ArrowLeft, ArrowRight,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Row = {
  id: string; name: string; email: string; phone: string | null;
  role: "ADMIN" | "EMPLOYER" | "SEEKER"; status: "ACTIVE" | "SUSPENDED" | "PENDING";
  avatarUrl: string | null; emailVerified: boolean;
  createdAt: string; updatedAt: string; lastLoginAt: string | null;
  applicationsCount: number; savedJobsCount: number;
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-600",
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN:    "bg-blue-50 text-blue-700",
  EMPLOYER: "bg-violet-50 text-violet-700",
  SEEKER:   "bg-teal-50 text-teal-700",
};

const AVATAR_COLORS = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-orange-500", "bg-rose-500", "bg-indigo-600"];

const PAGE_SIZE = 8;

export function UsersTable({
  users,
  stats,
}: {
  users: Row[];
  stats: { totalUsers: number; activeUsers: number; inactiveUsers: number; employers: number; seekers: number };
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.role.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex gap-5">
      {/* ── LEFT ── */}
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-zinc-900">User Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage all platform users and their access.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Users",    value: stats.totalUsers,    icon: UsersIcon,  bg: "bg-blue-50",    color: "text-blue-600",    sub: "All registered users" },
            { label: "Active Users",   value: stats.activeUsers,   icon: ShieldCheck, bg: "bg-emerald-50", color: "text-emerald-600", sub: "Currently active" },
            { label: "Inactive Users", value: stats.inactiveUsers, icon: UserX,      bg: "bg-amber-50",   color: "text-amber-600",   sub: "Deactivated accounts" },
            { label: "Employers",      value: stats.employers,     icon: Building2,  bg: "bg-violet-50",  color: "text-violet-600",  sub: "Company users" },
            { label: "Seekers",        value: stats.seekers,       icon: UserIcon,   bg: "bg-rose-50",    color: "text-rose-600",    sub: "Job seeker users" },
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
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users by name, email or role..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400">
            <option value="">All Roles</option>
            <option value="SEEKER">Seeker</option>
            <option value="EMPLOYER">Employer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[720px]">
          <div className="grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50 text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-semibold">
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
          </div>
          {pageRows.length === 0 ? (
            <div className="py-14 text-center text-sm text-zinc-400">No users match your filters.</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {pageRows.map((u, i) => {
                const initials = u.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <Link
                    key={u.id}
                    href={`/admin/users/${u.id}`}
                    className="grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr] gap-4 items-center px-6 py-3.5 cursor-pointer transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className={`h-10 w-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-xs shrink-0`}>{initials}</div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 text-sm truncate">{u.name}</div>
                        <div className="text-xs text-zinc-400 truncate">User ID: {u.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-600 truncate">{u.email}</div>
                    <div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[u.role]}`}>{u.role.charAt(0) + u.role.slice(1).toLowerCase()}</span>
                    </div>
                    <div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[u.status]}`}>{u.status.toLowerCase()}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{timeAgo(u.createdAt)}</div>
                  </Link>
                );
              })}
            </div>
          )}
          </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3.5 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center disabled:opacity-30"
              ><ArrowLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${n === page ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{n}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center disabled:opacity-30"
              ><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
