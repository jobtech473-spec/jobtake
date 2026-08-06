"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Pencil, Trash2, Briefcase } from "lucide-react";

type Experience = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
};

const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

function monthStr(d: string | Date) {
  return new Date(d).toISOString().slice(0, 7);
}
function fmt(d: string | Date) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

type FormState = {
  title: string; company: string; location: string;
  startDate: string; endDate: string; current: boolean; description: string;
};
const emptyForm: FormState = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };

export function ExperienceManager({ initialExperiences, compact = false, viewAllHref }: { initialExperiences: Experience[]; compact?: boolean; viewAllHref?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Experience[]>(initialExperiences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() { setForm(emptyForm); setAdding(true); setEditingId(null); }
  function startEdit(e: Experience) {
    setForm({
      title: e.title, company: e.company, location: e.location || "",
      startDate: monthStr(e.startDate), endDate: e.endDate ? monthStr(e.endDate) : "",
      current: e.current, description: e.description || "",
    });
    setEditingId(e.id); setAdding(false);
  }
  function cancel() { setAdding(false); setEditingId(null); setError(null); }

  async function save() {
    if (!form.title.trim() || !form.company.trim() || !form.startDate) { setError("Title, company and start date are required"); return; }
    setSaving(true); setError(null);
    const payload = {
      title: form.title, company: form.company, location: form.location || undefined,
      startDate: new Date(form.startDate + "-01").toISOString(),
      endDate: form.current || !form.endDate ? null : new Date(form.endDate + "-01").toISOString(),
      current: form.current, description: form.description || undefined,
    };
    const res = editingId
      ? await fetch(`/api/dashboard/experience/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/dashboard/experience`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save"); return; }
    const saved: Experience = editingId ? data.experience : data.experience;
    setItems(prev => editingId ? prev.map(i => i.id === editingId ? saved : i) : [saved, ...prev]);
    cancel();
    router.refresh();
  }

  async function remove(id: string) {
    setSaving(true);
    const res = await fetch(`/api/dashboard/experience/${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) { setItems(prev => prev.filter(i => i.id !== id)); router.refresh(); }
  }

  const list = compact ? items.slice(0, 3) : items;

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-zinc-500" />
          <h3 className="font-bold text-zinc-900 text-sm">{compact ? "Experience Summary" : "Experience"}</h3>
        </div>
        {!compact && (
          <button onClick={startAdd} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </button>
        )}
      </div>

      {error && <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>}

      {(adding || editingId) && !compact && (
        <div className="border border-zinc-200 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Job title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className={inputCls} placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <input className={inputCls} placeholder="Location (optional)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Start month</label>
              <input type="month" className={inputCls} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">End month</label>
              <input type="month" className={inputCls} disabled={form.current} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" checked={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.checked, endDate: "" }))} />
            I currently work here
          </label>
          <textarea className={inputCls + " resize-none"} rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-xs transition">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
            </button>
            <button onClick={cancel} className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition">Cancel</button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-zinc-400">No experience added yet — add your work history to strengthen your profile.</p>
      ) : (
        <div className="space-y-4">
          {list.map(e => (
            <div key={e.id} className="flex items-start gap-3 group">
              <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${e.current ? "bg-blue-600" : "bg-zinc-300"}`} />
              <div className="flex-1">
                <div className="text-sm font-bold text-zinc-900">{e.title}</div>
                <div className="text-xs text-zinc-500">{e.company}{e.location ? ` • ${e.location}` : ""}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{fmt(e.startDate)} – {e.current ? "Present" : (e.endDate ? fmt(e.endDate) : "—")}</div>
              </div>
              {!compact && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEdit(e)} className="text-zinc-400 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(e.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {compact && viewAllHref && (
        <Link href={viewAllHref} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">View Full Experience</Link>
      )}
    </div>
  );
}
