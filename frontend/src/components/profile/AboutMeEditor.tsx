"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AboutMeEditor({ initialBio, onDone }: { initialBio: string; onDone: () => void }) {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true); setError(null);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save"); return; }
    router.refresh();
    onDone();
  }

  return (
    <div>
      {error && <div className="mb-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>}
      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
        className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
        placeholder="Write a short bio about yourself..." />
      <div className="flex items-center gap-2 mt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-xs transition">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
        </button>
        <button onClick={onDone} className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">Cancel</button>
      </div>
    </div>
  );
}
