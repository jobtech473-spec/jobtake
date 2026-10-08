"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Bookmark, Loader2, Download } from "lucide-react";

type Stage = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED" | "WITHDRAWN";

const STAGES: Stage[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

const STAGE_LABEL: Record<Stage, string> = {
  APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export function CandidateActionBar({
  applicationId, initialStage, email, phone, resumeId,
}: {
  applicationId: string;
  initialStage: Stage;
  email: string;
  phone: string | null;
  resumeId: string | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(initialStage);
  const [busy, setBusy] = useState(false);

  async function updateStage(next: Stage) {
    setStage(next);
    setBusy(true);
    await fetch(`/api/employer/applications/${applicationId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <a href={`mailto:${email}`} title="Email"
          className="h-9 w-9 rounded-lg border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-700">
          <Mail className="h-4 w-4" />
        </a>
        {phone && (
          <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" title="WhatsApp"
            className="h-9 w-9 rounded-lg border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-emerald-600">
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
        <select value={stage} onChange={e => updateStage(e.target.value as Stage)} disabled={busy}
          className="text-sm font-semibold border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
        {resumeId && (
          <a href={`/api/resumes/${resumeId}`} target="_blank" rel="noreferrer" title="Download Resume"
            className="h-9 w-9 rounded-lg border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-700">
            <Download className="h-4 w-4" />
          </a>
        )}
        {busy && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => updateStage("SCREENING")} disabled={busy}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition disabled:opacity-60">
          <Bookmark className="h-3.5 w-3.5" /> Shortlist
        </button>
        <button onClick={() => updateStage("REJECTED")} disabled={busy}
          className="flex items-center gap-1.5 border border-red-200 text-red-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-60">
          ✕ Reject
        </button>
      </div>
    </div>
  );
}
