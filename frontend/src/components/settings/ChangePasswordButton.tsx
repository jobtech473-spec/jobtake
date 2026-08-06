"use client";
import { useState } from "react";
import { Modal } from "./Modal";

export function ChangePasswordButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setError(null); setSuccess(false); setLoading(false);
  }

  async function submit() {
    setError(null);
    if (newPassword.length < 8) return setError("New password must be at least 8 characters");
    if (newPassword !== confirmPassword) return setError("New passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setSuccess(true);
      setTimeout(() => { setOpen(false); reset(); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className={className ?? "text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-4 py-1.5 rounded-xl hover:bg-blue-100 transition"}
      >
        Change Password
      </button>
      {open && (
        <Modal title="Change Password" subtitle="Choose a strong password you don't use elsewhere." onClose={() => { setOpen(false); reset(); }}>
          {success ? (
            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              Password updated successfully.
            </div>
          ) : (
            <div className="space-y-3">
              {error && <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-300" />
              </div>
              <button
                onClick={submit}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-2"
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
