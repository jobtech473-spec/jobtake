"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Status = "ACTIVE" | "SUSPENDED" | "PENDING";

export function UserActionsPanel({ userId, initialStatus }: { userId: string; initialStatus: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, string>) {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-zinc-900 text-sm mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <button
          disabled={busy}
          onClick={() => { const next: Status = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"; setStatus(next); patch({ status: next }); }}
          className={`w-full flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-semibold disabled:opacity-50 ${status === "SUSPENDED" ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "SUSPENDED" ? "Reactivate" : "Suspend"}
        </button>
        <button
          disabled={busy || status === "PENDING"}
          onClick={() => { setStatus("PENDING"); patch({ status: "PENDING" }); }}
          className="w-full flex items-center justify-center gap-1.5 border border-amber-200 text-amber-600 rounded-lg py-2 text-xs font-semibold hover:bg-amber-50 disabled:opacity-50"
        >
          Mark Pending
        </button>
      </div>
    </div>
  );
}
