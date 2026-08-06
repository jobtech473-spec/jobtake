"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  startYear: number;
  endYear: number | null;
  description: string | null;
};

const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

type FormState = { school: string; degree: string; field: string; startYear: string; endYear: string; description: string };
const emptyForm: FormState = { school: "", degree: "", field: "", startYear: "", endYear: "", description: "" };

export function EducationManager({ initialEducations, compact = false, viewAllHref }: { initialEducations: Education[]; compact?: boolean; viewAllHref?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Education[]>(initialEducations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() { setForm(emptyForm); setAdding(true); setEditingId(null); }
  function startEdit(e: Education) {
    setForm({
      school: e.school, degree: e.degree, field: e.field || "",
      startYear: String(e.startYear), endYear: e.endYear ? String(e.endYear) : "",
      description: e.description || "",
    });
    setEditingId(e.id); setAdding(false);
  }
  function cancel() { setAdding(false); setEditingId(null); setError(null); }

  async function save() {
    const startYear = parseInt(form.startYear, 10);
    if (!form.school.trim() || !form.degree.trim() || !startYear) { setError("School, degree and start year are required"); return; }
    setSaving(true); setError(null);
    const payload = {
      school: form.school, degree: form.degree, field: form.field || undefined,
      startYear, endYear: form.endYear ? parseInt(form.endYear, 10) : null,
      description: form.description || undefined,
    };
    const res = editingId
      ? await fetch(`/api/dashboard/education/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/dashboard/education`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save"); return; }
    const saved: Education = data.education;
    setItems(prev => editingId ? prev.map(i => i.id === editingId ? saved : i) : [saved, ...prev]);
    cancel();
    router.refresh();
  }

  async function remove(id: string) {
    setSaving(true);
    const res = await fetch(`/api/dashboard/education/${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) { setItems(prev => prev.filter(i => i.id !== id)); router.refresh(); }
  }

  const list = compact ? items.slice(0, 3) : items;

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-zinc-500" />
          <h3 className="font-bold text-zinc-900 text-sm">Education</h3>
        </div>
        {!compact && (
          <button onClick={startAdd} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add Education
          </button>
        )}
      </div>

      {error && <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>}

      {(adding || editingId) && !compact && (
        <div className="border border-zinc-200 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="School / University" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
            <input className={inputCls} placeholder="Degree" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
          </div>
          <input className={inputCls} placeholder="Field of study (optional)" value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))} />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Start year</label>
              <input type="number" className={inputCls} value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">End year (optional)</label>
              <input type="number" className={inputCls} value={form.endYear} onChange={e => setForm(f => ({ ...f, endYear: e.target.value }))} />
            </div>
          </div>
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
        <p className="text-sm text-zinc-400">No education added yet — add your qualifications to strengthen your profile.</p>
      ) : (
        <div className="space-y-4">
          {list.map(e => (
            <div key={e.id} className="flex items-start justify-between group">
              <div>
                <div className="text-sm font-bold text-zinc-900">{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{e.school}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{e.startYear} – {e.endYear || "Present"}</div>
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
        <Link href={viewAllHref} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">View All Education</Link>
      )}
    </div>
  );
}
