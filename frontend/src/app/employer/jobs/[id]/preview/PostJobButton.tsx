"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, Send } from "lucide-react";

export function PostJobButton({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitForReview() {
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/employer/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PENDING" }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to submit for review");
      return;
    }

    router.refresh();
  }

  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Posted
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700">
        <Clock className="h-4 w-4" />
        Pending Admin Approval
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={submitForReview}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit for Review
      </button>
      {error && <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm">{error}</div>}
    </div>
  );
}
