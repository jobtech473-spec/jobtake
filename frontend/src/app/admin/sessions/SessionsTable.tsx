"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Monitor, LogOut, Loader2 } from "lucide-react";
import { timeAgo, formatDeviceLabel } from "@/lib/utils";

type Row = {
  sessionId: string;
  userId: string;
  userSerial: number;
  userName: string;
  userEmail: string;
  userRole: "ADMIN" | "EMPLOYER" | "SEEKER";
  userAvatarUrl: string | null;
  userLabel: string;
  userAgent: string | null;
  ipAddress: string | null;
  geoLocation: string | null;
  createdAt: string;
  lastActiveAt: string;
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN:    "bg-blue-50 text-blue-700",
  EMPLOYER: "bg-violet-50 text-violet-700",
  SEEKER:   "bg-teal-50 text-teal-700",
};

export function SessionsTable({ sessions }: { sessions: Row[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loggingOutUserId, setLoggingOutUserId] = useState<string | null>(null);

  const filtered = useMemo(() => sessions.filter(s => {
    if (roleFilter && s.userRole !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.userName.toLowerCase().includes(q) &&
        !s.userEmail.toLowerCase().includes(q) &&
        !s.userLabel.toLowerCase().includes(q) &&
        !(s.ipAddress ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  }), [sessions, search, roleFilter]);

  async function forceLogout(userId: string) {
    setLoggingOutUserId(userId);
    await fetch(`/api/admin/users/${userId}/clear-sessions`, { method: "POST" }).catch(() => null);
    setLoggingOutUserId(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Active Sessions</h1>
        <p className="text-sm text-zinc-500 mt-1">Everyone currently logged in to Jobtake, across all devices.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
          <Monitor className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-xl font-black text-zinc-900">{sessions.length}</div>
        <div className="text-xs font-semibold text-zinc-600 mt-0.5">Active Sessions</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, user ID or IP..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400">
          <option value="">All Roles</option>
          <option value="SEEKER">Seeker</option>
          <option value="EMPLOYER">Employer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50 text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-semibold">
              <div>User</div>
              <div>Role</div>
              <div>Device</div>
              <div>Location</div>
              <div>IP Address</div>
              <div>Last Active</div>
              <div>Actions</div>
            </div>
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-zinc-400">No active sessions match your filters.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {filtered.map(s => {
                  const initials = s.userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={s.sessionId} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-3.5">
                      <Link href={`/admin/users/${s.userId}`} className="flex items-center gap-3 min-w-0 hover:opacity-80">
                        {s.userAvatarUrl ? (
                          <img src={s.userAvatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">{initials}</div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 text-sm truncate">{s.userName}</div>
                          <div className="text-xs text-zinc-400 truncate">{s.userEmail}</div>
                        </div>
                      </Link>
                      <div>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[s.userRole]}`}>{s.userRole.charAt(0) + s.userRole.slice(1).toLowerCase()}</span>
                      </div>
                      <div className="text-sm text-zinc-600 truncate">{formatDeviceLabel(s.userAgent)}</div>
                      <div className="text-sm text-zinc-600 truncate">{s.geoLocation || "—"}</div>
                      <div className="text-sm text-zinc-600 font-mono truncate">{s.ipAddress || "—"}</div>
                      <div className="text-xs text-zinc-500">{timeAgo(s.lastActiveAt)}</div>
                      <div>
                        <button
                          type="button"
                          disabled={loggingOutUserId === s.userId}
                          onClick={() => forceLogout(s.userId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {loggingOutUserId === s.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                          Force Logout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
