"use client";
import { useState } from "react";
import { Pencil, Check, X as XIcon } from "lucide-react";

export function ProfileEditor({ initialName, email }: { initialName: string; email: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setSaved(name.trim());
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setName(saved);
    setError(null);
    setEditing(false);
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Pencil className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-zinc-900 text-sm">Profile Information</div>
            <div className="text-xs text-zinc-400">Update your personal information.</div>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            type="button"
            className="h-8 w-8 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition"
          >
            <Pencil className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              type="button"
              className="h-8 w-8 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              type="button"
              className="h-8 w-8 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition disabled:opacity-50"
            >
              <XIcon className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        {error && <div className="mb-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!editing}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none font-medium ${
                editing ? "border-blue-300 bg-white text-zinc-900" : "border-zinc-200 bg-white text-zinc-900"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Email Address</label>
            <input
              defaultValue={email}
              readOnly
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm outline-none bg-zinc-50 text-zinc-900 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
