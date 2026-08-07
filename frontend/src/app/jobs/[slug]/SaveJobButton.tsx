"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

export function SaveJobButton({ jobId, isLoggedIn, initialSaved }: { jobId: string; isLoggedIn: boolean; initialSaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (loading) return;
    const next = !saved;
    setLoading(true);
    setSaved(next);
    try {
      const res = await fetch("/api/saved-jobs", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSaved(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Unsave job" : "Save job"}
      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${saved ? "border-blue-200 bg-blue-50" : "border-zinc-200 hover:bg-zinc-50"}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "text-blue-600 fill-blue-600" : "text-zinc-700"}`} />
    </button>
  );
}
