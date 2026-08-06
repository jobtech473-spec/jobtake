"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "./Modal";

type SessionRow = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
};

function describeAgent(ua: string | null) {
  if (!ua) return "Unknown device";
  if (/mobile/i.test(ua)) return "Mobile browser";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  if (/edge/i.test(ua)) return "Edge";
  return "Browser";
}

export function SessionsRow({ label = "View Sessions" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function openModal() {
    setOpen(true);
    setError(null);
    setSessions(null);
    try {
      const res = await fetch("/api/account/sessions");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to load sessions");
      setSessions(data.sessions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    }
  }

  async function revoke(id: string) {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/account/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
    } catch {
      setError("Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <>
      <button onClick={openModal} type="button" className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-blue-600">{label}</span>
        <ChevronRight className="h-4 w-4 text-zinc-300" />
      </button>

      {open && (
        <Modal title="Active Sessions" subtitle="Devices currently signed in to your account." onClose={() => setOpen(false)} maxWidth="max-w-lg">
          {error && <div className="mb-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
          {sessions === null && !error && <div className="text-sm text-zinc-500">Loading…</div>}
          {sessions && sessions.length === 0 && <div className="text-sm text-zinc-500">No active sessions found.</div>}
          {sessions && sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-zinc-100 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                      {describeAgent(s.userAgent)}
                      {s.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 truncate">
                      {s.ipAddress ?? "Unknown IP"} · Last active {new Date(s.lastActiveAt).toLocaleString()}
                    </div>
                  </div>
                  {!s.isCurrent && (
                    <button
                      onClick={() => revoke(s.id)}
                      disabled={revokingId === s.id}
                      type="button"
                      className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50 shrink-0 ml-3"
                    >
                      {revokingId === s.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
