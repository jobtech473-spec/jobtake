"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

const MAX_LOGO_BYTES = 300 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type Row = { id: string; name: string; logoUrl: string; websiteUrl: string | null; sortOrder: number; active: boolean };

export function PartnerLogosEditor({ items }: { items: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState({ name: "", logoUrl: "", websiteUrl: "" });
  const newFileRef = useRef<HTMLInputElement>(null);

  async function uploadLogo(file: File | undefined, onDone: (dataUrl: string) => void) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Logo must be an image file."); return; }
    if (file.size > MAX_LOGO_BYTES) { setError(`Logo is too large (max ${Math.round(MAX_LOGO_BYTES / 1024)}KB).`); return; }
    const dataUrl = await readFileAsDataUrl(file);
    onDone(dataUrl);
  }

  async function patch(id: string, body: object) {
    setBusy(id);
    await fetch(`/api/admin/partner-logos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(null); router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Remove this company logo?")) return;
    setBusy(id);
    await fetch(`/api/admin/partner-logos/${id}`, { method: "DELETE" });
    setBusy(null); router.refresh();
  }
  async function create() {
    if (!n.name || !n.logoUrl) { setError("Name and logo are required."); return; }
    setBusy("new");
    await fetch("/api/admin/partner-logos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...n, sortOrder: items.length }),
    });
    setBusy(null); setN({ name: "", logoUrl: "", websiteUrl: "" }); router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Add new */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-zinc-900 text-sm">Add Company Logo</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Company Name</label>
            <input className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400"
              value={n.name} onChange={e => setN({ ...n, name: e.target.value })} placeholder="e.g. Flipkart" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Website (optional)</label>
            <input className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400"
              value={n.websiteUrl} onChange={e => setN({ ...n, websiteUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {n.logoUrl ? (
            <img src={n.logoUrl} alt="" className="h-10 w-auto max-w-[140px] object-contain border border-zinc-100 rounded-lg p-1" />
          ) : (
            <div className="h-10 w-28 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-xs text-zinc-400">No logo</div>
          )}
          <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-50 transition">
            <Upload className="h-3.5 w-3.5" /> Upload Logo
            <input ref={newFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { uploadLogo(e.target.files?.[0], url => setN(s => ({ ...s, logoUrl: url }))); e.target.value = ""; }} />
          </label>
          <button onClick={create} disabled={busy === "new"}
            className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition">
            {busy === "new" && <Loader2 className="h-4 w-4 animate-spin" />} <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Existing */}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(logo => (
          <div key={logo.id} className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={logo.logoUrl} alt={logo.name} className="h-10 w-auto max-w-[140px] object-contain" />
                <div>
                  <div className="font-semibold text-zinc-900 text-sm">{logo.name}</div>
                  {logo.websiteUrl && <div className="text-xs text-zinc-400 truncate max-w-[160px]">{logo.websiteUrl}</div>}
                </div>
              </div>
              <button onClick={() => remove(logo.id)} className="text-zinc-400 hover:text-red-500 shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 px-2.5 py-1.5 rounded-lg hover:bg-zinc-50">
                <Upload className="h-3 w-3" /> Replace
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { uploadLogo(e.target.files?.[0], url => patch(logo.id, { logoUrl: url })); e.target.value = ""; }} />
              </label>
              <button onClick={() => patch(logo.id, { active: !logo.active })}
                className={`text-[10.5px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full ${logo.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {logo.active ? "Active" : "Hidden"}
              </button>
              {busy === logo.id && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-zinc-400 col-span-2">No company logos added yet.</p>
        )}
      </div>
    </div>
  );
}
