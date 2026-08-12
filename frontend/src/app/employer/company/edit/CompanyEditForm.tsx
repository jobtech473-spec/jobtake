"use client";
import { useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, X, Plus, Upload } from "lucide-react";
import Link from "next/link";

const MAX_LOGO_BYTES = 400 * 1024;
const MAX_BANNER_BYTES = 900 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type Company = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  founded: number | null;
  headquarters: string | null;
  branchOffices: string[];
  logoUrl: string | null;
  bannerUrl: string | null;
  missionVision: string | null;
  whyJoinUs: string | null;
  workCulture: string | null;
  teamSize: string | null;
  galleryUrls: string[];
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  benefits: { id: string; label: string }[];
} | null;

const inputCls = "w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

function Field({ label, value, onChange, onBlur, type = "text", placeholder = "", min, max }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; type?: string; placeholder?: string; min?: number; max?: number }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} min={min} max={max} className={inputCls} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = "", rows = 4 }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} className={`${inputCls} resize-none`} />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
      <select value={value} onChange={onChange} className={inputCls}>
        {children}
      </select>
    </div>
  );
}

function TagList({ items, onRemove, colorCls }: { items: string[]; onRemove: (v: string) => void; colorCls: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {items.map(v => (
        <span key={v} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${colorCls}`}>
          {v}
          <button type="button" onClick={() => onRemove(v)} className="hover:text-red-500 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function CompanyEditForm({ company, industryOptions }: { company: Company; industryOptions: { id: string; label: string; value: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:          company?.name          ?? "",
    tagline:       company?.tagline       ?? "",
    description:   company?.description   ?? "",
    website:       company?.website       ?? "",
    industry:      company?.industry      ?? "",
    size:          company?.size          ?? "",
    founded:       company?.founded?.toString() ?? "",
    headquarters:  company?.headquarters  ?? "",
    logoUrl:       company?.logoUrl       ?? "",
    bannerUrl:     company?.bannerUrl     ?? "",
    missionVision: company?.missionVision ?? "",
    whyJoinUs:     company?.whyJoinUs     ?? "",
    workCulture:   company?.workCulture   ?? "",
    teamSize:      company?.teamSize      ?? "",
    linkedinUrl:   company?.linkedinUrl   ?? "",
    facebookUrl:   company?.facebookUrl   ?? "",
    instagramUrl:  company?.instagramUrl  ?? "",
    twitterUrl:    company?.twitterUrl    ?? "",
  });

  const [branchOffices, setBranchOffices] = useState<string[]>(company?.branchOffices ?? []);
  const [branchInput, setBranchInput] = useState("");

  const [galleryUrls, setGalleryUrls] = useState<string[]>(company?.galleryUrls ?? []);
  const [galleryInput, setGalleryInput] = useState("");

  const [benefits, setBenefits] = useState<string[]>(company?.benefits?.map(b => b.label) ?? []);
  const [benefitInput, setBenefitInput] = useState("");
  const benefitRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleImageUpload(field: "logoUrl" | "bannerUrl", file: File | undefined, maxBytes: number, label: string) {
    setUploadError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError(`${label} must be an image file.`); return; }
    if (file.size > maxBytes) { setUploadError(`${label} is too large (max ${Math.round(maxBytes / 1024)}KB).`); return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm(f => ({ ...f, [field]: dataUrl }));
    } catch {
      setUploadError(`Couldn't read that ${label.toLowerCase()} file. Try a different image.`);
    }
  }

  function addTo(list: string[], setList: (v: string[]) => void, value: string, clear: () => void) {
    const v = value.trim();
    if (v && !list.includes(v)) setList([...list, v]);
    clear();
  }

  function onBenefitKey(e: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      addTo(benefits, setBenefits, benefitInput, () => setBenefitInput(""));
    } else if (e.key === "Backspace" && !benefitInput && benefits.length) {
      setBenefits(benefits.slice(0, -1));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/employer/company", {
        method: company ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          founded: form.founded ? parseInt(form.founded) : null,
          branchOffices,
          galleryUrls,
          benefits,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save"); setLoading(false); return; }
      setSaved(true);
      setTimeout(() => { router.push("/employer/company"); router.refresh(); }, 800);
    } catch { setError("Network error"); setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Company Information */}
      <div id="info" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Company Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Company Name *" value={form.name} onChange={set("name")} placeholder="Acme Technologies" />
          <Select label="Industry" value={form.industry} onChange={set("industry")}>
            <option value="">Select industry</option>
            {industryOptions.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
          </Select>
          <Field label="Company Size" value={form.size} onChange={set("size")} placeholder="201-500" />
          <Field
            label="Founded Year" value={form.founded} onChange={set("founded")} type="number" placeholder="2010"
            min={1900} max={new Date().getFullYear()}
            onBlur={() => {
              const n = parseInt(form.founded, 10);
              if (!form.founded) return;
              const clamped = Number.isNaN(n) ? "" : String(Math.min(Math.max(n, 1900), new Date().getFullYear()));
              setForm(f => ({ ...f, founded: clamped }));
            }}
          />
          <Field label="Website" value={form.website} onChange={set("website")} placeholder="https://yourcompany.com" />
        </div>
        <div className="mt-4">
          <Field label="Tagline" value={form.tagline} onChange={set("tagline")} placeholder="Where teams build the future" />
        </div>
      </div>

      {/* Branding */}
      <div id="branding" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Branding</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Logo</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? <img src={form.logoUrl} alt="logo" className="h-full w-full object-contain" /> : <span className="text-xs text-zinc-400">No logo</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <button type="button" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                  <Upload className="h-3.5 w-3.5" /> {form.logoUrl ? "Change Logo" : "Upload Logo"}
                </button>
                {form.logoUrl && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, logoUrl: "" }))} className="text-xs text-zinc-400 hover:text-red-500 text-left">Remove</button>
                )}
                <input
                  ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageUpload("logoUrl", e.target.files?.[0], MAX_LOGO_BYTES, "Logo")}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Banner</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-28 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                {form.bannerUrl ? <img src={form.bannerUrl} alt="banner" className="h-full w-full object-cover" /> : <span className="text-xs text-zinc-400">No banner</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <button type="button" onClick={() => bannerInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                  <Upload className="h-3.5 w-3.5" /> {form.bannerUrl ? "Change Banner" : "Upload Banner"}
                </button>
                {form.bannerUrl && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, bannerUrl: "" }))} className="text-xs text-zinc-400 hover:text-red-500 text-left">Remove</button>
                )}
                <input
                  ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageUpload("bannerUrl", e.target.files?.[0], MAX_BANNER_BYTES, "Banner")}
                />
              </div>
            </div>
          </div>
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
        <p className="mt-3 text-xs text-zinc-400">Logo max {Math.round(MAX_LOGO_BYTES / 1024)}KB, banner max {Math.round(MAX_BANNER_BYTES / 1024)}KB. PNG or JPG recommended.</p>
      </div>

      {/* About Company */}
      <div id="about" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">About Company</h2>
        <div className="space-y-4">
          <TextArea label="Company Overview" value={form.description} onChange={set("description")} placeholder="Tell candidates about your company, culture, and mission..." />
          <TextArea label="Mission & Vision" value={form.missionVision} onChange={set("missionVision")} placeholder="What is your company's mission and long-term vision?" rows={3} />
          <TextArea label="Why Join Us" value={form.whyJoinUs} onChange={set("whyJoinUs")} placeholder="What makes your company a great place to work?" rows={3} />
          <TextArea label="Work Culture" value={form.workCulture} onChange={set("workCulture")} placeholder="Describe your team's day-to-day work culture..." rows={3} />
        </div>
      </div>

      {/* Locations */}
      <div id="locations" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Locations</h2>
        <Field label="Head Office" value={form.headquarters} onChange={set("headquarters")} placeholder="Mumbai, Maharashtra, India" />
        <div className="mt-4">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Branch Offices</label>
          <TagList items={branchOffices} onRemove={v => setBranchOffices(branchOffices.filter(x => x !== v))} colorCls="bg-teal-50 text-teal-700 border-teal-100" />
          <div className="flex gap-2">
            <input
              className={inputCls} value={branchInput} onChange={e => setBranchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTo(branchOffices, setBranchOffices, branchInput, () => setBranchInput("")); } }}
              placeholder="e.g. Bengaluru, Karnataka, India"
            />
            <button type="button" onClick={() => addTo(branchOffices, setBranchOffices, branchInput, () => setBranchInput(""))} className="shrink-0 h-[42px] w-[42px] rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50">
              <Plus className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits & Perks */}
      <div id="benefits" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Benefits &amp; Perks</h2>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Add benefits <span className="text-xs font-normal text-zinc-400">(type &amp; press Enter or comma)</span></label>
        <div
          className="min-h-[48px] w-full px-3 py-2 border border-zinc-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition flex flex-wrap gap-2 cursor-text bg-white"
          onClick={() => benefitRef.current?.focus()}
        >
          {benefits.map(b => (
            <span key={b} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">
              {b}
              <button type="button" onClick={() => setBenefits(benefits.filter(x => x !== b))} className="hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={benefitRef}
            className="flex-1 min-w-[140px] text-sm outline-none bg-transparent placeholder:text-zinc-400"
            value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
            onKeyDown={onBenefitKey}
            onBlur={() => benefitInput.trim() && addTo(benefits, setBenefits, benefitInput, () => setBenefitInput(""))}
            placeholder={benefits.length === 0 ? "Health Insurance, Flexible Hours, Bonus..." : "Add more..."}
          />
        </div>
      </div>

      {/* Team & Culture */}
      <div id="team" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Team &amp; Culture</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Team Size" value={form.teamSize} onChange={set("teamSize")} placeholder="e.g. 50-100 people" />
        </div>
        <p className="mt-3 text-xs text-zinc-400">Culture description is shared with &quot;Work Culture&quot; in the About Company section above.</p>
      </div>

      {/* Gallery */}
      <div id="gallery" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Gallery</h2>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Office / Team Photo URLs</label>
        {galleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {galleryUrls.map(url => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGalleryUrls(galleryUrls.filter(u => u !== url))}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className={inputCls} value={galleryInput} onChange={e => setGalleryInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTo(galleryUrls, setGalleryUrls, galleryInput, () => setGalleryInput("")); } }}
            placeholder="https://... image URL"
          />
          <button type="button" onClick={() => addTo(galleryUrls, setGalleryUrls, galleryInput, () => setGalleryInput(""))} className="shrink-0 h-[42px] w-[42px] rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50">
            <Plus className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Social Presence */}
      <div id="social" className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 scroll-mt-6">
        <h2 className="font-bold text-zinc-900 mb-4">Social Presence</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="LinkedIn" value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/company/..." />
          <Field label="Facebook" value={form.facebookUrl} onChange={set("facebookUrl")} placeholder="https://facebook.com/..." />
          <Field label="Instagram" value={form.instagramUrl} onChange={set("instagramUrl")} placeholder="https://instagram.com/..." />
          <Field label="Twitter / X" value={form.twitterUrl} onChange={set("twitterUrl")} placeholder="https://x.com/..." />
        </div>
      </div>

      {/* Error / Success */}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
      {saved && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">✓ Saved! Redirecting...</div>}

      {/* Actions */}
      <div className="sticky bottom-0 flex items-center gap-3 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent pt-4 pb-2">
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
        <Link href="/employer/company" className="flex items-center gap-2 border border-zinc-200 text-zinc-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Link>
      </div>
    </form>
  );
}
