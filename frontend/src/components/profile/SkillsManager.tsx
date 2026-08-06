"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Zap } from "lucide-react";

const inputCls = "w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

export function SkillsManager({ initialSkills }: { initialSkills: string[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addSkill(val: string) {
    const t = val.trim();
    if (t && !skills.some(s => s.toLowerCase() === t.toLowerCase())) setSkills(s => [...s, t]);
    setSkillInput("");
  }

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(false);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save skills"); return; }
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 1800);
  }

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h2 className="font-bold text-zinc-900 text-sm">Manage Skills</h2>
      </div>
      <div className="p-6">
        {error && <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
        {success && <div className="mb-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-2.5 rounded-xl">Skills saved!</div>}

        <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
          {skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {s}
              <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-red-500 transition">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && <span className="text-xs text-zinc-400">No skills added yet — add some to boost your profile.</span>}
        </div>

        <div className="flex gap-2">
          <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); addSkill(skillInput); } }}
            className={inputCls + " flex-1"} placeholder="Type a skill and press Enter (e.g. React)" />
          <button onClick={() => addSkill(skillInput)}
            className="px-4 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition">Add</button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">Press Enter or comma to add a skill</p>

        <button onClick={handleSave} disabled={saving}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Skills
        </button>
      </div>
    </div>
  );
}
