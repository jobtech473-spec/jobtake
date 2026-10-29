"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Mail, Lock, Eye, EyeOff, User, Phone, Upload,
  ShieldCheck, Briefcase, TrendingUp, Bell, Building2,
  CalendarDays, UserRound, FileText, GraduationCap, X,
  IndianRupee, MapPin, Clock, FileCheck2, ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { isValidIndianMobile } from "@/lib/utils";

const MAX_RESUME_BYTES = 2 * 1024 * 1024;
const NOTICE_PERIOD_OPTIONS = ["Immediate", "15 Days", "1 Month", "2 Months", "3 Months", "More than 3 Months"];

type ManagedOption = { id: string; label: string; value: string };

type EducationEntry = {
  education: string;
  specialization: string;
  specializationDetail: string;
  schoolName: string;
  passingYear: string;
};
function emptyEducationEntry(): EducationEntry {
  return { education: "", specialization: "", specializationDetail: "", schoolName: "", passingYear: "" };
}

// A native <select> opens its popup wherever the browser/OS decides (often
// centered on the selected option, which can look like it's floating above
// the field). This controlled, absolute-positioned panel always opens
// directly below the trigger instead.
function LocationSelect({
  value, onChange, locations, placeholder = "Select your location",
}: {
  value: string;
  onChange: (v: string) => void;
  locations: ManagedOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? locations.filter(l => l.label.toLowerCase().includes(search.trim().toLowerCase()))
    : locations;

  return (
    <div
      className="relative w-full"
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setOpen(false); setSearch(""); } }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 pl-10 pr-3 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white text-left"
      >
        <span className={`truncate ${value ? "text-zinc-800" : "text-zinc-400"}`}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-zinc-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.map(l => (
              <button key={l.id} type="button" onClick={() => { onChange(l.value); setOpen(false); setSearch(""); }}
                className="block w-full px-3 py-2 text-left text-sm text-zinc-900 hover:bg-blue-50 transition truncate">
                {l.label}
              </button>
            ))}
            {!filtered.length && <div className="px-3 py-3 text-sm text-zinc-400">No matching location.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// Same "always opens below the trigger" fix as LocationSelect, generalized
// for any admin-managed option list (used for Education specializations).
function SearchableSelect({
  value, onChange, options, placeholder, searchPlaceholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  options: ManagedOption[];
  placeholder: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  return (
    <div
      className="relative w-full"
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setOpen(false); setSearch(""); } }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white text-left"
      >
        <span className={`truncate ${value ? "text-zinc-800" : "text-zinc-400"}`}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-zinc-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className="block w-full px-3 py-2 text-left text-sm text-zinc-600 hover:bg-blue-50 transition">
              {placeholder}
            </button>
            {filtered.map(o => (
              <button key={o.id} type="button" onClick={() => { onChange(o.label); setOpen(false); setSearch(""); }}
                className="block w-full px-3 py-2 text-left text-sm text-zinc-900 hover:bg-blue-50 transition truncate">
                {o.label}
              </button>
            ))}
            {!filtered.length && <div className="px-3 py-3 text-sm text-zinc-400">No matches.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const MAX_GST_CERT_BYTES = 2 * 1024 * 1024;

const FIELD_LABEL: Record<string, string> = {
  email: "Email", password: "Password", name: "Name", phone: "Phone",
  gstNumber: "GST number", gstCertificateUrl: "GST certificate", companyName: "Company name",
};

function signupErrorMessage(data: { error?: string; details?: { fieldErrors?: Record<string, string[]> } }): string {
  const fieldErrors = data.details?.fieldErrors;
  if (fieldErrors) {
    const first = Object.entries(fieldErrors).find(([, v]) => Array.isArray(v) && v.length > 0);
    if (first) {
      const [field, messages] = first;
      const label = FIELD_LABEL[field] ?? field;
      return `${label}: ${messages[0]}`;
    }
  }
  return data.error || "Signup failed";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const INDUSTRY_OPTIONS = [
  "IT & Software", "Manufacturing", "Healthcare", "Finance & Banking",
  "Retail & FMCG", "Construction", "Logistics", "Education",
  "Hospitality", "Media & Entertainment", "Automobile", "Other",
];

const DESIGNATION_OPTIONS = [
  "HR Manager", "Recruiter", "Talent Acquisition", "CEO / Founder",
  "Director", "Manager", "Business Owner", "Consultant", "Other",
];

function EmployerSignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [gst, setGst] = useState("");
  const [gstCert, setGstCert] = useState("");
  const [gstCertName, setGstCertName] = useState("");
  const [gstCertError, setGstCertError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [regAs, setRegAs] = useState<"company" | "consultant">("company");
  const [designation, setDesignation] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGstCertUpload(file: File | undefined) {
    setGstCertError(null);
    if (!file) return;
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) { setGstCertError("Upload a PDF, JPG or PNG file."); return; }
    if (file.size > MAX_GST_CERT_BYTES) { setGstCertError(`File is too large (max ${Math.round(MAX_GST_CERT_BYTES / (1024 * 1024))}MB).`); return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setGstCert(dataUrl);
      setGstCertName(file.name);
    } catch {
      setGstCertError("Couldn't read that file. Try again.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianMobile(phone)) { setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9."); return; }
    if (!agreed) { setError("Please agree to Terms & Conditions."); return; }
    if (!gstCert) { setError("Please upload your GST certificate."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role: "EMPLOYER", phone,
          companyName: company, industry, gstNumber: gst, gstCertificateUrl: gstCert,
          registrationAs: regAs.toUpperCase(), designation, country: "India",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(signupErrorMessage(data)); setLoading(false); return; }
      router.push("/employer"); router.refresh();
    } catch {
      setError("Network error"); setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-5 border-b border-zinc-100">
        <span className="sm:hidden shrink-0"><Logo size={38} /></span>
        <span className="hidden sm:inline-flex shrink-0"><Logo size={72} /></span>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span className="hidden sm:inline">Already have an account?</span>
          <Link href="/login?role=employer" className="px-3 sm:px-4 py-2 rounded-lg border border-orange-400 text-orange-500 font-medium hover:bg-orange-50 transition">
            Sign in
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 grid place-items-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900">Create your employer account</h1>
          <p className="text-zinc-500 mt-1 text-sm">Join thousands of companies hiring top talent on Jobtake</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1 */}
          <div className="border border-zinc-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold grid place-items-center shrink-0">1</div>
              <h2 className="font-bold text-zinc-900 text-lg">Account Information</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Contact Person Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name"
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter work email"
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required minLength={8} type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="border border-zinc-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold grid place-items-center shrink-0">2</div>
              <h2 className="font-bold text-zinc-900 text-lg">Company Details</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Company Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Enter company name"
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Industry Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <select required value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition appearance-none bg-white text-zinc-600">
                    <option value="">Select industry type</option>
                    {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">GST Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required value={gst} onChange={e => setGst(e.target.value.toUpperCase())} placeholder="e.g. 22AAAAA0000A1Z5"
                    maxLength={15} pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z][Zz][0-9A-Za-z]" title="15-character GST number, e.g. 22AAAAA0000A1Z5"
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Upload GST Certificate <span className="text-red-500">*</span></label>
              {gstCert ? (
                <div className="flex items-center justify-between gap-3 border border-zinc-200 rounded-lg px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-zinc-700 truncate">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" /> {gstCertName}
                  </span>
                  <button type="button" onClick={() => { setGstCert(""); setGstCertName(""); }} className="text-xs text-zinc-400 hover:text-red-500 shrink-0">Remove</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 rounded-lg py-5 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition">
                  <Upload className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-zinc-600 font-medium">Click to upload GST certificate</span>
                  <span className="text-xs text-zinc-400">PDF, JPG or PNG (Max 2MB)</span>
                  <input required type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={e => { handleGstCertUpload(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              )}
              {gstCertError && <p className="text-xs text-red-600 mt-1.5">{gstCertError}</p>}
            </div>
          </div>

          {/* Section 3 */}
          <div className="border border-zinc-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold grid place-items-center shrink-0">3</div>
              <h2 className="font-bold text-zinc-900 text-lg">Additional Information</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-3 text-sm text-zinc-700 shrink-0">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number"
                      className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Registration As <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRegAs("company")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition ${regAs === "company" ? "bg-blue-600 text-white border-blue-600" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                    <Building2 className="h-4 w-4" /> Company
                  </button>
                  <button type="button" onClick={() => setRegAs("consultant")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition ${regAs === "consultant" ? "bg-blue-600 text-white border-blue-600" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                    <UserRound className="h-4 w-4" /> Consultant
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Designation <span className="text-red-500">*</span></label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <select value={designation} onChange={e => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition appearance-none bg-white text-zinc-600">
                    <option value="">Select your designation</option>
                    {DESIGNATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🌐</span>
                  <select className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition appearance-none bg-white text-zinc-700">
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>UAE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

          <div className="space-y-4">
            <label className="flex items-start gap-2.5 text-sm text-zinc-700 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 mt-0.5 shrink-0" />
              <div className="space-y-2.5">
                <p className="leading-relaxed">
                  I have read and agree to Jobtake&rsquo;s <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 underline">Terms & Conditions</Link>. I confirm that my company details, contact information and other information provided on the platform are correct and genuine.
                </p>
                <p className="leading-relaxed">
                  I agree to post genuine job openings and provide accurate details about job roles, salaries, locations and employment conditions. I will not post fake jobs, mislead candidates, collect money from candidates through false promises, misuse their personal information, or engage in spam, discrimination or abusive behaviour.
                </p>
                <p className="leading-relaxed">
                  I understand that providing false information, posting misleading jobs or misusing Jobtake may lead to account restriction, suspension / legal actions.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
              <input type="checkbox" checked={updates} onChange={e => setUpdates(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-blue-600" defaultChecked />
              I would like to receive important updates and promotions on email.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
            <div className="shrink-0 text-right">
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-60 ml-auto">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account →
              </button>
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center justify-end gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Your information is secure and protected</p>
            </div>
          </div>
        </form>

        {/* Trust badges */}
        <div className="grid md:grid-cols-3 gap-5 mt-10 pt-8 border-t border-zinc-100">
          {[
            { icon: ShieldCheck, color: "text-blue-600 bg-blue-100", title: "Trusted by 10,000+ Employers", desc: "From startups to leading enterprises" },
            { icon: User, color: "text-green-600 bg-green-100", title: "Find Quality Talent Faster", desc: "Post jobs and connect with the right talent" },
            { icon: TrendingUp, color: "text-purple-600 bg-purple-100", title: "Grow Your Business", desc: "Build your dream team with Jobtake" },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl ${color} grid place-items-center shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">{title}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandidateSignupForm() {
  const router = useRouter();
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const minDob = "1950-01-01";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Managed options (location / education / skills), sourced live from the
  // same admin-managed data every other page uses.
  const [locations, setLocations] = useState<ManagedOption[]>([]);
  const [educationOptions, setEducationOptions] = useState<ManagedOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<ManagedOption[]>([]);
  const [ugSpecializations, setUgSpecializations] = useState<ManagedOption[]>([]);
  const [pgSpecializations, setPgSpecializations] = useState<ManagedOption[]>([]);
  const [diplomaSpecializations, setDiplomaSpecializations] = useState<ManagedOption[]>([]);
  const [itiSpecializations, setItiSpecializations] = useState<ManagedOption[]>([]);
  useEffect(() => {
    fetch("/api/options").then(r => r.json()).then(d => {
      setLocations(d.options?.LOCATION ?? []);
      setEducationOptions(d.options?.EDUCATION ?? []);
      setSkillOptions(d.options?.SKILL ?? []);
      setUgSpecializations(d.options?.UG_SPECIALIZATION ?? []);
      setPgSpecializations(d.options?.PG_SPECIALIZATION ?? []);
      setDiplomaSpecializations(d.options?.DIPLOMA_SPECIALIZATION ?? []);
      setItiSpecializations(d.options?.ITI_SPECIALIZATION ?? []);
    }).catch(() => {});
  }, []);

  const [regType, setRegType] = useState<"EXPERIENCED" | "FRESHER">("EXPERIENCED");
  const [expYears, setExpYears] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([emptyEducationEntry()]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestOpen, setSkillSuggestOpen] = useState(false);
  const [bio, setBio] = useState("");

  const [resumeDataUrl, setResumeDataUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeError, setResumeError] = useState<string | null>(null);

  // A specialization sub-field only makes sense under UG/PG/Diploma/ITI —
  // same four levels PostJobForm asks employers to narrow down.
  function specializationGroupFor(level: string) {
    return (
      level === "Under Graduate (UG)" ? { label: "UG Specialization", options: ugSpecializations } :
      level === "Post Graduate (PG)" ? { label: "PG Specialization", options: pgSpecializations } :
      level === "Diploma" ? { label: "Diploma Specialization", options: diplomaSpecializations } :
      level === "ITI Pass" ? { label: "ITI Specialization", options: itiSpecializations } :
      null
    );
  }

  function updateEducationEntry(index: number, patch: Partial<EducationEntry>) {
    setEducationEntries(prev => prev.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
  }
  function onEducationLevelChange(index: number, value: string) {
    updateEducationEntry(index, { education: value, specialization: "", specializationDetail: "" });
  }
  function addEducationEntry() {
    setEducationEntries(prev => [...prev, emptyEducationEntry()]);
  }
  function removeEducationEntry(index: number) {
    setEducationEntries(prev => prev.filter((_, i) => i !== index));
  }

  function addSkill(value?: string) {
    const s = (value ?? skillInput).trim();
    if (!s) return;
    if (!skills.some(x => x.toLowerCase() === s.toLowerCase())) setSkills(prev => [...prev, s]);
    setSkillInput("");
    setSkillSuggestOpen(false);
  }
  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s));
  }

  const skillSuggestions = skillOptions.filter(o =>
    !skills.some(s => s.toLowerCase() === o.value.toLowerCase()) &&
    (!skillInput.trim() || o.label.toLowerCase().includes(skillInput.trim().toLowerCase()))
  );

  async function handleResumeUpload(file: File | undefined) {
    setResumeError(null);
    if (!file) return;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) { setResumeError("Upload a PDF, DOC or DOCX file."); return; }
    if (file.size > MAX_RESUME_BYTES) { setResumeError(`File is too large (max ${Math.round(MAX_RESUME_BYTES / (1024 * 1024))}MB).`); return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setResumeDataUrl(dataUrl);
      setResumeFileName(file.name);
    } catch {
      setResumeError("Couldn't read that file. Try again.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPw) { setError("Passwords do not match."); return; }
    if (!isValidIndianMobile(phone)) { setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9."); return; }
    if (!location) { setError("Please select your location."); return; }
    const primaryEducation = educationEntries[0];
    if (!primaryEducation.education || !primaryEducation.schoolName || !primaryEducation.passingYear) {
      setError("Please fill in your education details."); return;
    }
    for (const entry of educationEntries) {
      if (!entry.education) continue;
      if (!entry.schoolName || !entry.passingYear) { setError("Please fill in all fields for each qualification you've added."); return; }
      if (entry.education === "Diploma" && !entry.specializationDetail) {
        setError("Please select whether your Diploma was after 10th or 12th."); return;
      }
    }
    if (!resumeDataUrl) { setError("Please upload your resume."); return; }
    if (regType === "EXPERIENCED" && skills.length < 5) { setError("Please add at least 5 key skills."); return; }
    if (regType === "FRESHER" && skills.length < 1) { setError("Please add at least 1 key skill."); return; }
    if (!bio.trim()) { setError("Please fill in About Me."); return; }
    if (!agreed) { setError("Please agree to Terms & Conditions."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role: "SEEKER", phone,
          gender, dateOfBirth: dob,
          registrationType: regType,
          yearsExperience: regType === "EXPERIENCED" ? expYears : "0",
          currentSalary: regType === "EXPERIENCED" ? currentSalary : "",
          expectedSalary: regType === "EXPERIENCED" ? expectedSalary : "",
          noticePeriod: regType === "EXPERIENCED" ? noticePeriod : "",
          currentCompany: regType === "EXPERIENCED" ? currentCompany : "",
          currentDesignation: regType === "EXPERIENCED" ? currentDesignation : "",
          location, educationEntries, skills, bio,
          resumeDataUrl, resumeFileName,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(signupErrorMessage(data)); setLoading(false); return; }
      router.push("/dashboard"); router.refresh();
    } catch {
      setError("Network error"); setLoading(false);
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-5 border-b border-zinc-100">
        <span className="sm:hidden shrink-0"><Logo size={38} /></span>
        <span className="hidden sm:inline-flex shrink-0"><Logo size={72} /></span>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span className="hidden sm:inline">Already a member?</span>
          <Link href="/login" className="px-3 sm:px-4 py-2 rounded-lg border border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition">
            Sign in
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left — Why register */}
        <aside className="hidden lg:flex flex-col justify-between px-8 py-10 w-64 bg-blue-50 border-r border-blue-100 shrink-0 lg:sticky lg:top-0 lg:self-start lg:h-screen lg:overflow-y-auto">
          <div>
            <h3 className="font-black text-zinc-900 text-lg mb-6">Why register with Jobtake?</h3>
            <div className="space-y-5">
              {[
                { icon: Briefcase, color: "bg-blue-600 text-white", title: "Find Relevant Jobs", desc: "Discover opportunities that match your skills." },
                { icon: TrendingUp, color: "bg-green-500 text-white", title: "Build Your Career", desc: "Apply, track & grow your professional journey." },
                { icon: ShieldCheck, color: "bg-purple-600 text-white", title: "100% Secure", desc: "Your data is safe with us." },
                { icon: Bell, color: "bg-orange-400 text-white", title: "Stay Updated", desc: "Get alerts for the latest job openings." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl ${color} grid place-items-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 text-sm">{title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Illustration */}
          <div className="mt-8 rounded-2xl bg-blue-50 p-5 flex items-center justify-center">
            <img src="/employragistretion.png" alt="" className="w-full max-w-[240px] rounded-xl" />
          </div>
        </aside>

        {/* Right — Form */}
        <section className="flex-1 px-8 md:px-12 lg:px-16 py-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <UserRound className="h-3.5 w-3.5" /> Join Jobtake
              </div>
              <h1 className="text-3xl font-black text-zinc-900">Create your job seeker account</h1>
              <p className="text-zinc-500 mt-1 text-sm">One step closer to the right opportunities.</p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-7">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserRound className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Personal Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input required minLength={8} type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input required type={showCPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm your password" className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                      <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <select required value={gender} onChange={e => setGender(e.target.value)} className={inputClass + " appearance-none bg-white text-zinc-600"}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        required
                        type="date"
                        value={dob}
                        min={minDob}
                        max={maxDob}
                        onChange={e => setDob(e.target.value)}
                        className={inputClass + " bg-white text-zinc-600 [color-scheme:light]"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Contact Information</h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-3 text-sm text-zinc-700 shrink-0">
                      🇮🇳 +91 ▾
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number"
                        className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Professional Information</h2>
                </div>

                {/* Registration type */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Registration</label>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={regType === "FRESHER"}
                      onChange={e => setRegType(e.target.checked ? "FRESHER" : "EXPERIENCED")}
                      className="w-4 h-4 rounded border-zinc-300 accent-blue-600"
                    />
                    <span className="text-sm font-medium text-zinc-700">Registration Fresher (I don&rsquo;t have any work experience)</span>
                  </label>
                </div>

                <div className="space-y-4">
                  {regType === "EXPERIENCED" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Years of Experience <span className="text-red-500">*</span></label>
                        <input required type="number" min={0} max={50} step="1" value={expYears} onChange={e => setExpYears(e.target.value)} placeholder="e.g. 4"
                          className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Notice Period <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <select required value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className={inputClass + " appearance-none bg-white text-zinc-600"}>
                            <option value="">Select notice period</option>
                            {NOTICE_PERIOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Current CTC (Lacs PA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input required type="number" min={0} step="0.1" value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} placeholder="e.g. 8" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Expected CTC (Lacs PA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input required type="number" min={0} step="0.1" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} placeholder="e.g. 12" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Current Company <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input required value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="Enter your current company name" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Current Designation <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input required value={currentDesignation} onChange={e => setCurrentDesignation(e.target.value)} placeholder="Enter your current designation" className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10 pointer-events-none" />
                      <LocationSelect value={location} onChange={setLocation} locations={locations} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">About Me <span className="text-red-500">*</span></label>
                    <textarea required value={bio} onChange={e => setBio(e.target.value.slice(0, 500))} rows={3} placeholder="Write a short summary about yourself, your experience, key strengths and what you are looking for..."
                      className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none" />
                    <p className="text-xs text-zinc-400 text-right mt-1">{bio.length}/500</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Education</h2>
                </div>

                <div className="space-y-5">
                  {educationEntries.map((entry, index) => {
                    const group = specializationGroupFor(entry.education);
                    return (
                      <div key={index} className={index > 0 ? "pt-5 border-t border-zinc-100" : ""}>
                        {index > 0 && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-zinc-500">Additional qualification</span>
                            <button type="button" onClick={() => removeEducationEntry(index)} className="text-xs text-zinc-400 hover:text-red-500">Remove</button>
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Education {index === 0 && <span className="text-red-500">*</span>}</label>
                            <div className="relative">
                              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <select required={index === 0} value={entry.education} onChange={e => onEducationLevelChange(index, e.target.value)} className={inputClass + " appearance-none bg-white text-zinc-600"}>
                                <option value="">Select qualification</option>
                                {educationOptions.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                          </div>

                          {group && (
                            <div>
                              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{group.label}</label>
                              <SearchableSelect
                                value={entry.specialization}
                                onChange={v => updateEducationEntry(index, { specialization: v })}
                                options={group.options}
                                placeholder="Select specialization"
                                searchPlaceholder="Search specialization..."
                              />
                            </div>
                          )}

                          {entry.education === "Diploma" && (
                            <div>
                              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Diploma pursued after <span className="text-red-500">*</span></label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => updateEducationEntry(index, { specializationDetail: "After 10th" })}
                                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${entry.specializationDetail === "After 10th" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                                  After 10th
                                </button>
                                <button type="button" onClick={() => updateEducationEntry(index, { specializationDetail: "After 12th" })}
                                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${entry.specializationDetail === "After 12th" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                                  After 12th
                                </button>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">School / University {index === 0 && <span className="text-red-500">*</span>}</label>
                            <input required={index === 0} value={entry.schoolName} onChange={e => updateEducationEntry(index, { schoolName: e.target.value })} placeholder="Enter your school or university name"
                              className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Passing Year {index === 0 && <span className="text-red-500">*</span>}</label>
                            <input required={index === 0} type="number" min={1950} max={today.getFullYear() + 10} value={entry.passingYear} onChange={e => updateEducationEntry(index, { passingYear: e.target.value })} placeholder="e.g. 2022"
                              className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button type="button" onClick={addEducationEntry} className="inline-flex items-center gap-1 px-4 py-2.5 border border-blue-200 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 transition">
                    + Add More Education
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Key Skills <span className="text-red-500">*</span>
                    <span className="text-zinc-400 font-normal"> {regType === "EXPERIENCED" ? "(Minimum 5 required)" : "(Minimum 1 required)"}</span>
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="relative flex-1"
                      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSkillSuggestOpen(false); }}
                    >
                      <input
                        value={skillInput}
                        onChange={e => { setSkillInput(e.target.value); setSkillSuggestOpen(true); }}
                        onFocus={() => setSkillSuggestOpen(true)}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
                        placeholder="Type a skill, or pick a suggestion..."
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                      {skillSuggestOpen && skillSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl py-1">
                          {skillSuggestions.map(o => (
                            <button key={o.id} type="button" onClick={() => addSkill(o.value)}
                              className="block w-full px-3 py-2 text-left text-sm text-zinc-900 hover:bg-blue-50 transition truncate">
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 flex items-center text-xs text-zinc-400 px-1">{skills.length}/{regType === "EXPERIENCED" ? 5 : 1}</span>
                    <button type="button" onClick={() => addSkill()} className="shrink-0 flex items-center gap-1 px-4 py-3 border border-blue-200 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 transition">
                      + Add More
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Attach Resume <span className="text-red-500">*</span></label>
                  {resumeDataUrl ? (
                    <div className="flex items-center justify-between gap-3 border border-zinc-200 rounded-lg px-4 py-3">
                      <span className="flex items-center gap-2 text-sm text-zinc-700 truncate">
                        <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" /> {resumeFileName}
                      </span>
                      <button type="button" onClick={() => { setResumeDataUrl(""); setResumeFileName(""); }} className="text-xs text-zinc-400 hover:text-red-500 shrink-0">Remove</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300 rounded-xl py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                      <Upload className="h-6 w-6 text-blue-500" />
                      <span className="text-sm text-zinc-600 font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs text-zinc-400">PDF, DOC, DOCX (Max 2 MB)</span>
                      <input required type="file" accept=".pdf,.doc,.docx" className="hidden"
                        onChange={e => { handleResumeUpload(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  )}
                  {resumeError && <p className="text-xs text-red-600 mt-1.5">{resumeError}</p>}
                </div>
              </div>

              {/* Additional */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Additional</h2>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start gap-2.5 text-sm text-zinc-700 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 mt-0.5 shrink-0" />
                    <div className="space-y-2.5">
                      <p className="leading-relaxed">
                        I have read and agree to Jobtake&rsquo;s <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 underline">Terms & Conditions</Link>. I confirm that the details I have provided, including my resume, education, skills and work experience, are correct and genuine.
                      </p>
                      <p className="leading-relaxed">
                        I agree not to provide false information, fake documents, incorrect qualifications or work experience, or use someone else&rsquo;s identity. I will not misuse the platform, mislead employers, send spam or engage in abusive behaviour.
                      </p>
                      <p className="leading-relaxed">
                        I understand that providing false information or misusing Jobtake may lead to suspension of my account / legal action.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
                    <input type="checkbox" checked={alerts} onChange={e => setAlerts(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-blue-600" />
                    I want to receive job alerts and updates on email.
                  </label>
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition text-base disabled:opacity-60">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Create Account →
              </button>
            </form>

            {/* Bottom trust section */}
            <div className="mt-10 pt-8 border-t border-zinc-100">
              <p className="text-center font-semibold text-zinc-900 text-base mb-5">Millions trust Jobtake for their career journey</p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, color: "text-blue-600 bg-blue-100", title: "Verified Employers", desc: "Apply to trusted companies" },
                  { icon: Briefcase, color: "text-green-600 bg-green-100", title: "Relevant Opportunities", desc: "Jobs that match your profile" },
                  { icon: TrendingUp, color: "text-orange-500 bg-orange-100", title: "Easy & Fast", desc: "Simple registration process" },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl ${color} grid place-items-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 text-sm">{title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-zinc-400 mt-6 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Your information is safe and will never be shared.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SignupRouter() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  if (role === "employer") return <EmployerSignupForm />;
  return <CandidateSignupForm />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}>
      <SignupRouter />
    </Suspense>
  );
}
