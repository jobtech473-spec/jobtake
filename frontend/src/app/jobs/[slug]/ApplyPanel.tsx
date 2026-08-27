"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Upload, Sparkles } from "lucide-react";

export function ApplyPanel({ jobId, jobTitle, userRole, hasApplied }: {
  jobId: string; jobTitle: string; userRole: "ADMIN" | "EMPLOYER" | "SEEKER" | null; hasApplied: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.set("jobId", jobId);
      if (coverLetter) form.set("coverLetter", coverLetter);
      if (resume) form.set("resume", resume);
      const res = await fetch("/api/applications", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Failed to apply"); return; }
      setDone(true);
      setTimeout(() => router.refresh(), 600);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!userRole) {
    return (
      <div className="space-y-3" data-testid="apply-login-panel">
        <Link href="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center transition-colors text-sm" data-testid="apply-login">
          Sign in
        </Link>
        <Link href="/signup" className="w-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold py-3 rounded-xl flex items-center justify-center transition-colors text-sm" data-testid="apply-signup">
          Create account
        </Link>
      </div>
    );
  }

  if (userRole !== "SEEKER") {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold">Apply</div>
        <p className="mt-3 text-sm text-zinc-700">Only candidate accounts can apply. You're signed in as <span className="font-medium">{userRole.toLowerCase()}</span>.</p>
      </div>
    );
  }

  if (hasApplied || done) {
    return (
      <div className="glass-strong rounded-3xl p-6" data-testid="apply-success">
        <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        <div className="mt-3 font-display text-lg font-medium text-zinc-950">Application submitted</div>
        <p className="text-sm text-zinc-600 mt-1">We've shared your profile with the hiring team. Track progress in your dashboard.</p>
        <Link href="/dashboard/applications" className="btn-primary rounded-full px-4 py-2 text-sm font-medium inline-flex mt-4">View applications</Link>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-6" data-testid="apply-panel">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold">One-click apply</div>
      <h3 className="font-display mt-2 text-xl font-medium text-zinc-950">Apply to {jobTitle}</h3>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary rounded-full px-5 py-3 text-sm font-medium w-full mt-5 inline-flex items-center justify-center gap-2" data-testid="apply-open">
          <Sparkles className="h-4 w-4" /> Apply now
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="label">Resume (PDF/DOCX)</label>
            <label className="input cursor-pointer flex items-center gap-2 text-sm text-zinc-700">
              <Upload className="h-4 w-4" />
              {resume ? resume.name : "Upload your resume"}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResume(e.target.files?.[0] || null)} data-testid="apply-resume" />
            </label>
          </div>
          <div>
            <label className="label">Cover letter <span className="lowercase text-zinc-400">(optional)</span></label>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="input" placeholder="Why this team?" data-testid="apply-cover" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2" data-testid="apply-error">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary rounded-full px-5 py-3 text-sm font-medium w-full inline-flex items-center justify-center gap-2" data-testid="apply-submit">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
          </button>
        </form>
      )}
    </div>
  );
}
