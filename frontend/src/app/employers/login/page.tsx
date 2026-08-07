"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Mail, Lock, Eye, EyeOff,
  ShieldCheck, Users, Briefcase, TrendingUp, ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function EmployerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole: "EMPLOYER" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      router.push("/employer"); router.refresh();
    } catch {
      setError("Network error"); setLoading(false);
    }
  }

  const features = [
    {
      icon: Users,
      title: "Find Quality Talent",
      desc: "Access verified professionals across engineering, manufacturing, IT, sales, finance, HR, and more.",
    },
    {
      icon: Briefcase,
      title: "Simplified Hiring",
      desc: "Post jobs, manage applications, shortlist candidates, and schedule interviews from one dashboard.",
    },
    {
      icon: TrendingUp,
      title: "Build Better Teams",
      desc: "Hire faster with powerful recruitment tools designed for businesses of every size.",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-100">
        <Logo size={72} />
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          Looking for talent?
          <Link
            href="/signup?role=employer"
            className="px-4 py-2 rounded-lg border border-orange-400 text-orange-500 font-semibold hover:bg-orange-50 transition"
          >
            Create Employer Account
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">

        {/* Left — Form */}
        <section className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 w-full lg:w-[55%] border-r border-zinc-100">
          <div className="max-w-sm w-full mx-auto">

            {/* Welcome badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              👋 Welcome back!
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 leading-tight">
              Sign in to your <br />
              <span className="text-orange-500">Employer Account</span>
            </h1>
            <p className="text-zinc-500 mt-3 text-sm leading-relaxed">
              Manage your job postings, track applicants,<br />
              and hire the right talent—all from one dashboard.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Company Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your company email"
                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-zinc-600 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-zinc-300 w-4 h-4" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-orange-500 font-medium hover:text-orange-600">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60 text-base"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* SSO */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs text-zinc-400">or continue with</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border border-zinc-200 rounded-lg py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-zinc-200 rounded-lg py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition">
                <svg className="h-4 w-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400 mt-10">
            © 2026 Jobtake™. All rights reserved. &nbsp;·&nbsp;
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            &nbsp;|&nbsp;
            <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
          </p>
        </section>

        {/* Right — Marketing panel */}
        <aside className="hidden lg:flex flex-col justify-center px-16 py-12 flex-1 bg-white border-l border-zinc-200">
          <div className="max-w-md mx-auto">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-orange-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted by professionals and companies.
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight">
              Hire smarter,<br />
              <span className="text-orange-500">faster.</span>
            </h2>

            <p className="text-zinc-600 mt-6 text-base leading-relaxed">
              Connect with skilled professionals, manage recruitment efficiently, and make better hiring decisions—all in one place.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-orange-50 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 text-sm">{title}</div>
                    <div className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-8 bg-orange-50 rounded-2xl border border-orange-100 p-4 flex items-center gap-4">
              <div className="flex -space-x-2 shrink-0">
                {["men/22", "women/56", "men/78", "women/12"].map((path, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${path}.jpg`}
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-sm text-zinc-700 leading-snug">
                <span className="font-semibold">Join thousands of employers</span><br />
                <span className="text-zinc-500">Hiring top talent through <span className="font-semibold text-orange-500">Jobtake.</span></span>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
