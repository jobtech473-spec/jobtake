"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, MapPin, Phone, FileText, Zap, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

const inputCls = "w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

type Props = {
  initialName: string;
  initialHeadline: string;
  initialBio: string;
  initialPhone: string;
  initialLocation: string;
  initialSkills: string[];
};

export function EditProfileClient({ initialName, initialHeadline, initialBio, initialPhone, initialLocation, initialSkills }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);

  const [name, setName]         = useState(initialName);
  const [headline, setHeadline] = useState(initialHeadline);
  const [bio, setBio]           = useState(initialBio);
  const [phone, setPhone]       = useState(initialPhone);
  const [location, setLocation] = useState(initialLocation);
  const [skills, setSkills]     = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");

  function addSkill(val: string) {
    const t = val.trim();
    if (t && !skills.some(s => s.toLowerCase() === t.toLowerCase())) setSkills(s => [...s, t]);
    setSkillInput("");
  }

  async function handleResumeUpload(file: File) {
    setUploadingResume(true); setError(null);
    const form = new FormData();
    form.append("resume", file);
    const res = await fetch("/api/dashboard/resume", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploadingResume(false);
    if (!res.ok) { setError(data.error || "Failed to upload resume"); return; }
    setResumeName(data.resume.fileName);
  }

  async function handleSave() {
    setSaving(true); setError(null);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, headline, bio, phone, location, skills }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard/profile"), 1200);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition mb-1">
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>
          <h1 className="text-2xl font-black text-zinc-900">Edit Profile</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Update your personal information and skills.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {success ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error   && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl">Profile updated! Redirecting…</div>}

      <div className="max-w-2xl space-y-5">

        {/* Basic Info */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <h2 className="font-bold text-zinc-900 text-sm">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Professional Headline</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} placeholder="e.g. Senior Frontend Engineer · 5 yrs exp" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">About Me</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                className={inputCls + " resize-none"} placeholder="Write a short bio about yourself..." />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <h2 className="font-bold text-zinc-900 text-sm">Contact Information</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls + " pl-10"} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input value={location} onChange={e => setLocation(e.target.value)} className={inputCls + " pl-10"} placeholder="e.g. Mumbai, India" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h2 className="font-bold text-zinc-900 text-sm">Skills</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {s}
                  <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-red-500 transition">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && <span className="text-xs text-zinc-400">No skills added yet.</span>}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); addSkill(skillInput); } }}
                className={inputCls + " flex-1"} placeholder="Type a skill and press Enter (e.g. React)" />
              <button onClick={() => addSkill(skillInput)}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Add</button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">Press Enter or comma to add a skill</p>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h2 className="font-bold text-zinc-900 text-sm">Resume</h2>
          </div>
          <div className="p-6">
            <label className="cursor-pointer block border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center hover:border-blue-300 hover:bg-blue-50 transition">
              {uploadingResume ? <Loader2 className="h-10 w-10 text-zinc-300 animate-spin" /> : <FileText className="h-10 w-10 text-zinc-300" />}
              <div>
                <div className="text-sm font-semibold text-zinc-700">
                  {resumeName ? `Uploaded: ${resumeName}` : "Upload your resume"}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">PDF, DOC or DOCX · Max 5MB</div>
              </div>
              <span className="bg-white border border-zinc-200 text-zinc-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-50 transition">Choose File</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); e.target.value = ""; }} />
            </label>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/dashboard/profile" className="px-5 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">Cancel</Link>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {success ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
