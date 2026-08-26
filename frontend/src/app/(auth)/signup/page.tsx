"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Mail, Lock, Eye, EyeOff, User, Phone, Upload,
  ShieldCheck, Briefcase, TrendingUp, Bell, Building2,
  CalendarDays, UserRound, FileText,
} from "lucide-react";
import { Logo } from "@/components/Logo";

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
  const [phone, setPhone] = useState("");
  const [regAs, setRegAs] = useState<"company" | "consultant">("company");
  const [designation, setDesignation] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("Please agree to Terms & Conditions."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role: "EMPLOYER", phone,
          companyName: company, industry, gstNumber: gst,
          registrationAs: regAs.toUpperCase(), designation, country: "India",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
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
                  <input value={gst} onChange={e => setGst(e.target.value)} placeholder="Enter GST number"
                    className="w-full pl-9 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
              </div>
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
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter mobile number"
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-zinc-300" />
                I agree to the <Link href="/terms" className="text-blue-600 underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
              </label>
              <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
                <input type="checkbox" checked={updates} onChange={e => setUpdates(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-blue-600" defaultChecked />
                I would like to receive important updates and promotions on email.
              </label>
            </div>
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [expYears, setExpYears] = useState("");
  const [expMonths, setExpMonths] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPw) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please agree to Terms & Conditions."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role: "SEEKER", phone,
          gender, dateOfBirth: dob, expYears: expYears,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); setLoading(false); return; }
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
        <aside className="hidden lg:flex flex-col justify-between px-8 py-10 w-64 bg-blue-50 border-r border-blue-100 shrink-0">
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
            <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[240px]">
              {/* Background card / resume */}
              <rect x="40" y="20" width="130" height="160" rx="12" fill="#DBEAFE" />
              <rect x="40" y="20" width="130" height="160" rx="12" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Avatar circle */}
              <circle cx="80" cy="58" r="18" fill="#BFDBFE" />
              <circle cx="80" cy="52" r="8" fill="#60A5FA" />
              <path d="M62 74c0-10 8-16 18-16s18 6 18 16" fill="#60A5FA" />

              {/* Text lines on resume */}
              <rect x="108" y="46" width="44" height="6" rx="3" fill="#93C5FD" />
              <rect x="108" y="58" width="32" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="88" width="96" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="98" width="80" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="108" width="88" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="122" width="96" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="132" width="64" height="4" rx="2" fill="#BFDBFE" />
              <rect x="56" y="146" width="72" height="4" rx="2" fill="#BFDBFE" />

              {/* Plant stem + leaves */}
              <path d="M200 190 Q200 165 195 155" stroke="#6EE7B7" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="189" cy="148" rx="14" ry="9" fill="#34D399" transform="rotate(-30 189 148)" />
              <ellipse cx="202" cy="142" rx="12" ry="8" fill="#6EE7B7" transform="rotate(20 202 142)" />
              <ellipse cx="192" cy="135" rx="10" ry="7" fill="#34D399" transform="rotate(-10 192 135)" />
              {/* Pot */}
              <path d="M193 190 L207 190 L205 175 L195 175 Z" fill="#93C5FD" />
              <rect x="191" y="188" width="18" height="4" rx="2" fill="#60A5FA" />

              {/* Magnifying glass */}
              <circle cx="158" cy="130" r="28" fill="white" fillOpacity="0.9" stroke="#3B82F6" strokeWidth="3" />
              <circle cx="158" cy="130" r="20" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
              {/* Glass reflection */}
              <circle cx="151" cy="122" r="4" fill="white" fillOpacity="0.6" />
              {/* Handle */}
              <line x1="179" y1="151" x2="198" y2="170" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
              <line x1="179" y1="151" x2="198" y2="170" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

              {/* Small dots decoration */}
              <circle cx="30" cy="40" r="4" fill="#BFDBFE" />
              <circle cx="22" cy="55" r="3" fill="#93C5FD" />
              <circle cx="35" cy="65" r="2" fill="#BFDBFE" />
            </svg>
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
                      <select value={dob} onChange={e => setDob(e.target.value)} className={inputClass + " appearance-none bg-white text-zinc-600"}>
                        <option value="">Select date</option>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
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
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter mobile number"
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Total Experience <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <select value={expYears} onChange={e => setExpYears(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition appearance-none bg-white text-zinc-600">
                        <option value="">Select years</option>
                        {["Fresher", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "15+"].map(y => <option key={y}>{y}</option>)}
                      </select>
                      <select value={expMonths} onChange={e => setExpMonths(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition appearance-none bg-white text-zinc-600">
                        <option value="">Select months</option>
                        {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => <option key={m} value={m}>{m} month{m !== 1 ? "s" : ""}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Attach Resume <span className="text-red-500">*</span></label>
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300 rounded-xl py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                      <Upload className="h-6 w-6 text-blue-500" />
                      <span className="text-sm text-zinc-600 font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs text-zinc-400">PDF, DOC, DOCX (Max 2 MB)</span>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <h2 className="font-bold text-zinc-900">Additional</h2>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded border-zinc-300" />
                    I agree to the <Link href="/terms" className="text-blue-600 underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
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
