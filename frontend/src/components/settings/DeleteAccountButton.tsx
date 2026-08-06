"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";

export function DeleteAccountButton({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setPassword(""); setConfirmText(""); setError(null); setLoading(false);
  }

  async function submit() {
    setError(null);
    if (confirmText !== "DELETE") return setError('Type "DELETE" to confirm');
    if (!password) return setError("Password is required");
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete account");
      router.push(data.redirect ?? "/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className={className ?? "text-sm font-semibold text-red-600 border border-red-200 bg-red-50 px-4 py-1.5 rounded-xl hover:bg-red-100 transition"}
      >
        Delete Account
      </button>
      {open && (
        <Modal title="Delete Account" subtitle="This action is permanent and cannot be undone." onClose={() => { setOpen(false); reset(); }}>
          <div className="space-y-3">
            {error && <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Confirm Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-red-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-red-300" />
            </div>
            <button
              onClick={submit}
              disabled={loading || !password || confirmText !== "DELETE"}
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-2"
            >
              {loading ? "Deleting…" : "Permanently Delete Account"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
