"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Loader2, Trash2 } from "lucide-react";

type Resume = { id: string; fileName: string; fileUrl: string; fileSize: number; isPrimary: boolean; createdAt: string };

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeManager({ initialResumes, compact = false }: { initialResumes: Resume[]; compact?: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primary = resumes.find(r => r.isPrimary) || resumes[0];

  async function handleFile(file: File) {
    setUploading(true); setError(null);
    const form = new FormData();
    form.append("resume", file);
    const res = await fetch("/api/dashboard/resume", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) { setError(data.error || "Failed to upload resume"); return; }
    setResumes(prev => [data.resume, ...prev.map(r => ({ ...r, isPrimary: false }))]);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/dashboard/resume/${id}`, { method: "DELETE" });
    if (res.ok) { setResumes(prev => prev.filter(r => r.id !== id)); router.refresh(); }
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-zinc-500" />
        <h3 className="font-bold text-zinc-900 text-sm">Resume</h3>
      </div>

      {error && <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>}

      {primary ? (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
            <FileText className="h-6 w-6 text-zinc-400" />
          </div>
          <a href={primary.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-700 hover:text-blue-600 hover:underline">{primary.fileName}</a>
          <div className="text-xs text-zinc-400">{fmtSize(primary.fileSize)} • Updated on {new Date(primary.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2">
          <FileText className="h-8 w-8 text-zinc-300" />
          <div className="text-sm text-zinc-400">No resume uploaded yet — add one so employers can see your experience.</div>
        </div>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="mt-3 w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-zinc-50 transition disabled:opacity-60">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Update Resume"}
      </button>

      {!compact && resumes.length > 1 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Previous versions</div>
          {resumes.filter(r => !r.isPrimary).map(r => (
            <div key={r.id} className="flex items-center justify-between text-sm text-zinc-600 py-1.5">
              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate">{r.fileName}</a>
              <button onClick={() => remove(r.id)} className="text-zinc-400 hover:text-red-500 shrink-0 ml-2"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
