"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  tagline: string | null;
  price: number;
  jobs: number;
  perJob: number | null;
  save: number | null;
  badge: string | null;
  features: string[];
  active: boolean;
  sortOrder: number;
};

type Draft = {
  name: string; tagline: string; price: string; jobs: string;
  perJob: string; save: string; badge: string; features: string;
};

function emptyDraft(): Draft {
  return { name: "", tagline: "", price: "0", jobs: "1", perJob: "", save: "", badge: "", features: "" };
}

function toDraft(p: Plan): Draft {
  return {
    name: p.name, tagline: p.tagline ?? "", price: String(p.price), jobs: String(p.jobs),
    perJob: p.perJob != null ? String(p.perJob) : "", save: p.save != null ? String(p.save) : "",
    badge: p.badge ?? "", features: p.features.join(", "),
  };
}

function draftToBody(d: Draft) {
  return {
    name: d.name.trim(),
    tagline: d.tagline.trim() || undefined,
    price: Math.max(0, parseInt(d.price, 10) || 0),
    jobs: Math.max(1, parseInt(d.jobs, 10) || 1),
    perJob: d.perJob.trim() ? parseInt(d.perJob, 10) : null,
    save: d.save.trim() ? parseInt(d.save, 10) : null,
    badge: d.badge.trim() || null,
    features: d.features.split(",").map(f => f.trim()).filter(Boolean),
  };
}

export function PlansManager({ initialPlans }: { initialPlans: Plan[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialPlans.map(p => [p.id, toDraft(p)])),
  );
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync drafts whenever fresh data comes in from the server (after a
  // create/save/delete triggers router.refresh()) — adds drafts for newly
  // created plans and drops ones that were deleted, without clobbering
  // in-progress edits on plans that are still there.
  useEffect(() => {
    setDrafts(prev => {
      const next: Record<string, Draft> = {};
      for (const p of initialPlans) next[p.id] = prev[p.id] ?? toDraft(p);
      return next;
    });
  }, [initialPlans]);

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function createPlan() {
    if (!newDraft.name.trim()) { setError("Plan name is required"); return; }
    setCreating(true);
    setError(null);
    const res = await fetch("/api/admin/plans", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draftToBody(newDraft)),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) { setError(data.error || "Failed to create plan"); return; }
    setNewDraft(emptyDraft());
    router.refresh();
  }

  async function savePlan(id: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draftToBody(drafts[id])),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) { setError(data.error || "Failed to save plan"); return; }
    router.refresh();
  }

  async function toggleActive(plan: Plan) {
    setBusyId(plan.id);
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !plan.active }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function removePlan(id: string) {
    if (!confirm("Delete this plan? Employers will no longer see it on the Pricing page.")) return;
    setBusyId(id);
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      {/* Existing plans */}
      <div className="space-y-4">
        {initialPlans.map(plan => {
          const d = drafts[plan.id] ?? toDraft(plan);
          return (
            <div key={plan.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${plan.active ? "border-zinc-100" : "border-zinc-200 opacity-60"}`}>
              <div className="grid md:grid-cols-4 gap-3">
                <Field label="Plan name">
                  <input value={d.name} onChange={e => updateDraft(plan.id, { name: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Badge (optional)">
                  <input value={d.badge} onChange={e => updateDraft(plan.id, { badge: e.target.value })} placeholder="e.g. POPULAR" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Price (₹, 0 = free)">
                  <input type="number" min={0} value={d.price} onChange={e => updateDraft(plan.id, { price: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Job credits">
                  <input type="number" min={1} value={d.jobs} onChange={e => updateDraft(plan.id, { jobs: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Per-job price (optional)">
                  <input type="number" min={0} value={d.perJob} onChange={e => updateDraft(plan.id, { perJob: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Savings ₹ (optional)">
                  <input type="number" min={0} value={d.save} onChange={e => updateDraft(plan.id, { save: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Tagline" className="md:col-span-2">
                  <input value={d.tagline} onChange={e => updateDraft(plan.id, { tagline: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
                <Field label="Features (comma separated)" className="md:col-span-4">
                  <input value={d.features} onChange={e => updateDraft(plan.id, { features: e.target.value })} placeholder="1 job posting, 30-day listing, ..." className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </Field>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                <button onClick={() => toggleActive(plan)} disabled={busyId === plan.id}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${plan.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {plan.active ? "Active — visible to employers" : "Inactive — hidden"}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => removePlan(plan.id)} disabled={busyId === plan.id}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => savePlan(plan.id)} disabled={busyId === plan.id}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg disabled:opacity-50">
                    {busyId === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {initialPlans.length === 0 && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center text-sm text-zinc-400">
            No plans yet. Add one below.
          </div>
        )}
      </div>

      {/* New plan */}
      <div className="bg-white rounded-2xl border border-dashed border-zinc-300 shadow-sm p-5">
        <div className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add a new plan</div>
        <div className="grid md:grid-cols-4 gap-3">
          <Field label="Plan name"><input value={newDraft.name} onChange={e => setNewDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Mega Pack" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Badge (optional)"><input value={newDraft.badge} onChange={e => setNewDraft(d => ({ ...d, badge: e.target.value }))} placeholder="e.g. POPULAR" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Price (₹, 0 = free)"><input type="number" min={0} value={newDraft.price} onChange={e => setNewDraft(d => ({ ...d, price: e.target.value }))} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Job credits"><input type="number" min={1} value={newDraft.jobs} onChange={e => setNewDraft(d => ({ ...d, jobs: e.target.value }))} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Per-job price (optional)"><input type="number" min={0} value={newDraft.perJob} onChange={e => setNewDraft(d => ({ ...d, perJob: e.target.value }))} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Savings ₹ (optional)"><input type="number" min={0} value={newDraft.save} onChange={e => setNewDraft(d => ({ ...d, save: e.target.value }))} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Tagline" className="md:col-span-2"><input value={newDraft.tagline} onChange={e => setNewDraft(d => ({ ...d, tagline: e.target.value }))} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></Field>
          <Field label="Features (comma separated)" className="md:col-span-4">
            <input value={newDraft.features} onChange={e => setNewDraft(d => ({ ...d, features: e.target.value }))} placeholder="1 job posting, 30-day listing, ..." className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
          </Field>
        </div>
        <button onClick={createPlan} disabled={creating}
          className="mt-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Plan
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-zinc-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
