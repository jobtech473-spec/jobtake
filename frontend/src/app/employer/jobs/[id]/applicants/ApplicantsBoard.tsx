"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Loader2, FileDown, Search, SlidersHorizontal, MapPin, Briefcase, X, ExternalLink, Bookmark, ArrowRight, ArrowLeft, MoreVertical, Mail, MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Stage = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED" | "WITHDRAWN";

type App = {
  id: string; stage: Stage; rating: number | null; matchScore: number | null;
  user: {
    id: string; name: string; email: string; headline: string | null; location: string | null;
    phone?: string | null; bio?: string | null; avatarUrl?: string | null; yearsExperience?: number | null;
    noticePeriod?: string | null; currentSalary?: number | null; expectedSalary?: number | null;
    preferredLocations?: string[];
    experiences?: { title: string; company: string; current: boolean }[];
    educations?: { degree: string; field: string | null; school: string }[];
    skills?: string[];
  };
  resumeUrl: string | null; coverLetter: string | null; createdAt: string;
};

const STAGES: Stage[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

const STAGE_LABEL: Record<Stage, string> = {
  APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

const STAGE_BADGE: Record<Stage, string> = {
  APPLIED:   "bg-blue-50 text-blue-700",
  SCREENING: "bg-violet-50 text-violet-700",
  INTERVIEW: "bg-amber-50 text-amber-700",
  OFFER:     "bg-emerald-50 text-emerald-700",
  HIRED:     "bg-emerald-100 text-emerald-800",
  REJECTED:  "bg-red-50 text-red-600",
  WITHDRAWN: "bg-zinc-100 text-zinc-500",
};

const MATCH_COLOR = (score: number) =>
  score >= 85 ? "bg-emerald-50 text-emerald-700" :
  score >= 70 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";

const AVATAR_COLORS = ["bg-blue-600","bg-violet-600","bg-teal-600","bg-rose-500","bg-orange-500","bg-indigo-600"];

const DEMO_APPLICANTS: App[] = [
  { id: "demo-1", stage: "APPLIED",   rating: null, matchScore: 87, createdAt: new Date(Date.now()-1*86400000).toISOString(), resumeUrl: null, coverLetter: "I am very interested in this role and believe my background in digital marketing aligns well with your requirements.", user: { id: "d1", name: "Priya Sharma",  email: "priya.sharma@gmail.com",  headline: "Digital Marketing Executive", location: "Mumbai, India",    phone: "+91 98765 43210", bio: "Results-driven digital marketing professional with expertise in SEO, PPC, social media marketing and content strategy." } },
  { id: "demo-2", stage: "SCREENING", rating: 4,    matchScore: 92, createdAt: new Date(Date.now()-2*86400000).toISOString(), resumeUrl: null, coverLetter: null, user: { id: "d2", name: "Rahul Verma",   email: "rahul.v@outlook.com",     headline: "SEO & SEM Specialist",      location: "Bangalore, India", phone: "+91 87654 32109", bio: "5 years of experience in SEO and SEM, driving organic growth for B2B and B2C brands." } },
  { id: "demo-3", stage: "INTERVIEW", rating: 5,    matchScore: 95, createdAt: new Date(Date.now()-3*86400000).toISOString(), resumeUrl: null, coverLetter: null, user: { id: "d3", name: "Ananya Patel",  email: "ananya.p@yahoo.com",      headline: "Growth Marketer",           location: "Pune, India",      phone: "+91 76543 21098", bio: "Growth marketer with a data-driven approach to user acquisition and retention." } },
  { id: "demo-4", stage: "OFFER",     rating: 4,    matchScore: 89, createdAt: new Date(Date.now()-5*86400000).toISOString(), resumeUrl: null, coverLetter: null, user: { id: "d4", name: "Karan Mehta",   email: "karan.m@gmail.com",       headline: "Brand & Campaign Manager",  location: "Delhi, India",     phone: "+91 65432 10987", bio: "Brand strategist with 6+ years managing integrated marketing campaigns." } },
  { id: "demo-5", stage: "APPLIED",   rating: null, matchScore: 72, createdAt: new Date(Date.now()-5*86400000).toISOString(), resumeUrl: null, coverLetter: null, user: { id: "d5", name: "Sneha Joshi",   email: "sneha.joshi@gmail.com",   headline: "Social Media Executive",    location: "Ahmedabad, India", phone: "+91 54321 09876", bio: "Social media enthusiast with 1 year experience in content creation and community management." } },
  { id: "demo-6", stage: "REJECTED",  rating: 2,    matchScore: 68, createdAt: new Date(Date.now()-6*86400000).toISOString(), resumeUrl: null, coverLetter: null, user: { id: "d6", name: "Nikhil Pande",  email: "nikhil.p@gmail.com",      headline: "Performance Marketing Specialist", location: "Hyderabad, India", phone: "+91 43210 98765", bio: "Performance marketer focused on paid media, analytics and conversion rate optimisation." } },
];

const DEMO_SKILLS: Record<string, string[]> = {
  "d1": ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Content Marketing", "Email Marketing"],
  "d2": ["SEO", "SEM", "Google Analytics", "Ahrefs", "Link Building"],
  "d3": ["Growth Hacking", "A/B Testing", "Product Analytics", "CRM", "Funnel Optimization"],
  "d4": ["Brand Strategy", "Campaign Management", "Copywriting", "Media Planning", "PR"],
  "d5": ["Instagram", "Content Creation", "Canva", "Community Management"],
  "d6": ["Google Ads", "Meta Ads", "CRO", "Analytics", "Landing Pages"],
};

const DEMO_EXP: Record<string, { title: string; company: string; period: string }> = {
  "d1": { title: "Digital Marketing Executive", company: "Tech Solutions Pvt. Ltd.", period: "Jun 2021 - Present (3 yrs)" },
  "d2": { title: "SEO Specialist", company: "DigitalBoost Agency", period: "Mar 2019 - Present (5 yrs)" },
  "d3": { title: "Growth Marketer", company: "StartupXYZ", period: "Jan 2020 - Present (4 yrs)" },
  "d4": { title: "Brand Manager", company: "FMCG Corp Ltd.", period: "Apr 2018 - Present (6 yrs)" },
  "d5": { title: "Social Media Executive", company: "Creative Studio", period: "Jul 2023 - Present (1 yr)" },
  "d6": { title: "Performance Marketer", company: "AdTech Solutions", period: "Jan 2021 - Present (3 yrs)" },
};

const DEMO_EDU: Record<string, { degree: string; school: string; period: string }> = {
  "d1": { degree: "Bachelor of Business Administration", school: "University of Mumbai", period: "2018 - 2021" },
  "d2": { degree: "Bachelor of Computer Applications", school: "Delhi University", period: "2015 - 2018" },
  "d3": { degree: "MBA - Marketing", school: "IIM Bangalore", period: "2018 - 2020" },
  "d4": { degree: "Bachelor of Management Studies", school: "NMIMS Mumbai", period: "2014 - 2017" },
  "d5": { degree: "Bachelor of Arts - Media", school: "Gujarat University", period: "2020 - 2023" },
  "d6": { degree: "B.Tech - Computer Science", school: "JNTU Hyderabad", period: "2017 - 2021" },
};

export function ApplicantsBoard({ applications, jobId, jobTitle }: { applications: App[]; jobId: string; jobTitle?: string }) {
  const router = useRouter();
  const isDemo = applications.length === 0;
  const list = isDemo ? DEMO_APPLICANTS : applications;

  const [selected, setSelected] = useState<App>(list[0]);
  const [busy, setBusy]         = useState(false);
  const [search, setSearch]     = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = list.filter(a =>
    !search ||
    a.user.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.user.headline ?? "").toLowerCase().includes(search.toLowerCase()) ||
    a.user.email.toLowerCase().includes(search.toLowerCase())
  );

  async function updateStage(id: string, stage: Stage) {
    if (isDemo) { setSelected(s => ({ ...s, stage })); return; }
    setBusy(true);
    await fetch(`/api/employer/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }),
    });
    setBusy(false);
    router.refresh();
    if (selected?.id === id) setSelected(s => ({ ...s, stage }));
  }

  async function setRating(id: string, rating: number) {
    if (isDemo) { setSelected(s => ({ ...s, rating })); return; }
    setBusy(true);
    await fetch(`/api/employer/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating }),
    });
    setBusy(false);
    router.refresh();
    if (selected?.id === id) setSelected(s => ({ ...s, rating }));
  }

  const expYears = (h: string | null) => {
    const m = (h ?? "").match(/(\d+)\s*yr/);
    return m ? `${m[1]} yrs exp` : null;
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">

      {/* ── LEFT — List ── */}
      <div className="space-y-3">

        {isDemo && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium">
            <span>👋</span> Demo preview — these are sample applicants. Real applicants will appear here once candidates apply.
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skills or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white" />
          </div>
          {["Stage", "Experience", "Location"].map(f => (
            <button key={f} className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 border border-zinc-200 bg-white px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition">
              {f} <span className="text-zinc-300">▾</span>
            </button>
          ))}
          <button className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 border border-zinc-200 bg-white px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition">
            <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
          </button>
          <div className="ml-auto text-xs text-zinc-400 font-medium">Sort by: <span className="text-zinc-700 font-semibold">Newest ▾</span></div>
        </div>

        {/* Applicant rows */}
        {filtered.map((a, i) => {
          const initials = a.user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const exp = a.user.yearsExperience ? `${a.user.yearsExperience} yrs exp` : expYears(a.user.headline);
          const isSelected = selected?.id === a.id;
          const current = a.user.experiences?.find(e => e.current) ?? a.user.experiences?.[0];
          const previous = a.user.experiences?.find(e => e !== current);
          const education = a.user.educations?.[0];
          const skills = a.user.skills ?? [];
          return (
            <div key={a.id} onClick={() => setSelected(a)}
              className={`bg-white border-2 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all ${isSelected ? "border-blue-400 shadow-sm" : "border-zinc-100 shadow-sm"}`}
              data-testid={`applicant-${a.id}`}>
              <div className="flex items-center gap-4">
                {/* Radio */}
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-blue-600 bg-blue-600" : "border-zinc-300"}`}>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                {/* Avatar */}
                {a.user.avatarUrl ? (
                  <img src={a.user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{initials}</div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 text-sm">{a.user.name}</span>
                    {a.stage === "APPLIED" && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase">New</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STAGE_BADGE[a.stage]}`}>{STAGE_LABEL[a.stage]}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {a.user.headline}{exp ? ` · ${exp}` : ""}
                    {a.user.currentSalary != null && ` · ₹${a.user.currentSalary} Lac(s)`}
                    {a.user.noticePeriod && ` · ${a.user.noticePeriod} notice`}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{a.user.location}
                  </div>
                </div>
                {/* Applied + Match + menu */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-zinc-400">Applied {timeAgo(a.createdAt)}</div>
                  {a.matchScore && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${MATCH_COLOR(a.matchScore)}`}>{a.matchScore}% Match</span>
                  )}
                  {a.rating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: a.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  ) : null}
                  <div className="relative" ref={menuOpenId === a.id ? menuRef : undefined}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(id => id === a.id ? null : a.id); }}
                      className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center"
                    >
                      <MoreVertical className="h-4 w-4 text-zinc-400" />
                    </button>
                    {menuOpenId === a.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg py-1"
                      >
                        <button
                          onClick={() => { setSelected(a); setMenuOpenId(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => { updateStage(a.id, "SCREENING"); setMenuOpenId(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => { updateStage(a.id, "REJECTED"); setMenuOpenId(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current / Previous / Education / Skills */}
              {(current || previous || education || skills.length > 0) && (
                <div className="mt-3 pt-3 border-t border-zinc-50 pl-16 space-y-1.5 text-xs">
                  {current && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-semibold w-20 shrink-0">Current</span>
                      <span className="text-zinc-600">{current.title} at {current.company}</span>
                    </div>
                  )}
                  {previous && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-semibold w-20 shrink-0">Previous</span>
                      <span className="text-zinc-600">{previous.title} at {previous.company}</span>
                    </div>
                  )}
                  {education && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-semibold w-20 shrink-0">Education</span>
                      <span className="text-zinc-600">{education.degree}{education.field ? ` in ${education.field}` : ""}, {education.school}</span>
                    </div>
                  )}
                  {a.user.preferredLocations && a.user.preferredLocations.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-semibold w-20 shrink-0">Pref. locations</span>
                      <span className="text-zinc-600">{a.user.preferredLocations.join(", ")}</span>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-zinc-400 font-semibold w-20 shrink-0">Key skills</span>
                      <span className="text-zinc-600">{skills.join(" | ")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {a.user.email && (
                    <a href={`mailto:${a.user.email}`} onClick={e => e.stopPropagation()} title="Email"
                      className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {a.user.phone && (
                    <a href={`https://wa.me/${a.user.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="WhatsApp"
                      className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-600">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => updateStage(a.id, "SCREENING")} disabled={busy}
                    className="flex items-center gap-1.5 border border-emerald-200 text-emerald-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition">
                    <Bookmark className="h-3 w-3" /> Shortlist
                  </button>
                  <button onClick={() => updateStage(a.id, "REJECTED")} disabled={busy}
                    className="flex items-center gap-1.5 border border-red-200 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-400">Showing 1 to {filtered.length} of {list.length} applicants</span>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowLeft className="h-4 w-4" /></button>
            {[1, 2, 3, 4].map(n => (
              <button key={n} className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${n === 1 ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{n}</button>
            ))}
            <button className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 flex items-center justify-center"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Detail Panel ── */}
      <aside className="lg:sticky lg:top-6 h-fit">
        {!selected ? (
          <div className="bg-white border border-zinc-100 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-zinc-400 text-sm">Select an applicant to view their profile.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden" data-testid="applicant-detail">

            {/* Header */}
            <div className="p-5 border-b border-zinc-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  {selected.user.avatarUrl ? (
                    <img src={selected.user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className={`h-12 w-12 rounded-full ${AVATAR_COLORS[list.findIndex(a => a.id === selected.id) % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                      {selected.user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 text-base">{selected.user.name}</div>
                    <div className="text-xs text-zinc-500">{selected.user.email}</div>
                    {selected.user.headline && (
                      <div className="text-xs text-zinc-400 mt-0.5">{selected.user.headline} · {expYears(selected.user.headline) ?? "exp"}</div>
                    )}
                    {selected.user.location && (
                      <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{selected.user.location}</div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null as unknown as App)} className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center shrink-0">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>

              {/* Contact */}
              {selected.user.email && <div className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5">✉ {selected.user.email}</div>}
              {selected.user.phone && <div className="mt-1 text-xs text-zinc-500 flex items-center gap-1.5">📞 {selected.user.phone}</div>}
            </div>

            {/* Stage + Applied */}
            <div className="px-5 py-4 border-b border-zinc-50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1.5">Stage</div>
                <select value={selected.stage} onChange={e => updateStage(selected.id, e.target.value as Stage)}
                  disabled={busy}
                  className="w-full text-sm font-semibold border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
                  {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1.5">Applied</div>
                <div className="text-sm font-semibold text-zinc-800">{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                <div className="text-xs text-zinc-400">{timeAgo(selected.createdAt)}</div>
              </div>
              {selected.user.currentSalary != null && (
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1.5">Current Salary</div>
                  <div className="text-sm font-semibold text-zinc-800">₹{selected.user.currentSalary} Lac(s)</div>
                </div>
              )}
              {selected.user.expectedSalary != null && (
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1.5">Expected Salary</div>
                  <div className="text-sm font-semibold text-zinc-800">₹{selected.user.expectedSalary} Lac(s)</div>
                </div>
              )}
              {selected.user.noticePeriod && (
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1.5">Notice Period</div>
                  <div className="text-sm font-semibold text-zinc-800">{selected.user.noticePeriod}</div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 py-3 border-b border-zinc-50 flex gap-2">
              <button onClick={() => updateStage(selected.id, "SCREENING")} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-xl transition">
                <Bookmark className="h-3.5 w-3.5" /> Shortlist
              </button>
              <button onClick={() => updateStage(selected.id, "INTERVIEW")} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-200 text-zinc-700 font-semibold text-xs py-2 rounded-xl hover:bg-zinc-50 transition">
                Move Stage
              </button>
              <button onClick={() => updateStage(selected.id, "REJECTED")} disabled={busy}
                className="flex items-center justify-center gap-1.5 border border-red-200 text-red-600 font-semibold text-xs py-2 px-3 rounded-xl hover:bg-red-50 transition">
                ✕ Reject
              </button>
            </div>

            {/* Rating */}
            <div className="px-5 py-3 border-b border-zinc-50">
              <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Rating</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} disabled={busy} onClick={() => setRating(selected.id, n)} data-testid={`rate-${n}`}>
                    <Star className={`h-6 w-6 transition-colors ${(selected.rating || 0) >= n ? "text-amber-400 fill-amber-400" : "text-zinc-200 hover:text-amber-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Cover letter / Resume */}
            {selected.coverLetter && (
              <div className="px-5 py-3 border-b border-zinc-50">
                <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Cover Letter</div>
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-4">{selected.coverLetter}</p>
              </div>
            )}
            {selected.resumeUrl && (
              <div className="px-5 py-3 border-b border-zinc-50">
                <a href={selected.resumeUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-700 font-semibold text-xs px-3 py-2 rounded-xl hover:bg-zinc-50 transition">
                  <FileDown className="h-3.5 w-3.5" /> View Resume
                </a>
              </div>
            )}

            {/* About Candidate */}
            {selected.user.bio && (
              <div className="px-5 py-3 border-b border-zinc-50">
                <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">About Candidate</div>
                <p className="text-xs text-zinc-600 leading-relaxed">{selected.user.bio}</p>
              </div>
            )}

            {/* Skills */}
            {isDemo ? (
              DEMO_SKILLS[selected.user.id] && (
                <div className="px-5 py-3 border-b border-zinc-50">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_SKILLS[selected.user.id].map(s => (
                      <span key={s} className="text-[11px] font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )
            ) : (
              selected.user.skills && selected.user.skills.length > 0 && (
                <div className="px-5 py-3 border-b border-zinc-50">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.user.skills.map(s => (
                      <span key={s} className="text-[11px] font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Experience */}
            {isDemo ? (
              DEMO_EXP[selected.user.id] && (
                <div className="px-5 py-3 border-b border-zinc-50">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Experience</div>
                  <div className="text-xs font-bold text-zinc-800">{DEMO_EXP[selected.user.id].title}</div>
                  <div className="text-xs text-zinc-500">{DEMO_EXP[selected.user.id].company}</div>
                  <div className="text-xs text-zinc-400">{DEMO_EXP[selected.user.id].period}</div>
                </div>
              )
            ) : (
              selected.user.experiences && selected.user.experiences.length > 0 && (
                <div className="px-5 py-3 border-b border-zinc-50 space-y-2">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-1">Experience</div>
                  {selected.user.experiences.map((exp, j) => (
                    <div key={j}>
                      <div className="text-xs font-bold text-zinc-800">{exp.title}</div>
                      <div className="text-xs text-zinc-500">{exp.company}{exp.current ? " · Current" : ""}</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Education */}
            {isDemo ? (
              DEMO_EDU[selected.user.id] && (
                <div className="px-5 py-3 border-b border-zinc-50">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Education</div>
                  <div className="text-xs font-bold text-zinc-800">{DEMO_EDU[selected.user.id].degree}</div>
                  <div className="text-xs text-zinc-500">{DEMO_EDU[selected.user.id].school}</div>
                  <div className="text-xs text-zinc-400">{DEMO_EDU[selected.user.id].period}</div>
                </div>
              )
            ) : (
              selected.user.educations && selected.user.educations.length > 0 && (
                <div className="px-5 py-3 border-b border-zinc-50">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-zinc-400 mb-2">Education</div>
                  <div className="text-xs font-bold text-zinc-800">{selected.user.educations[0].degree}{selected.user.educations[0].field ? ` — ${selected.user.educations[0].field}` : ""}</div>
                  <div className="text-xs text-zinc-500">{selected.user.educations[0].school}</div>
                </div>
              )
            )}

            {/* View Full Profile */}
            <div className="px-5 py-4">
              {isDemo ? (
                <button disabled className="w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-300 font-semibold text-sm py-2.5 rounded-xl cursor-not-allowed">
                  View Full Profile <ExternalLink className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link href={`/employer/candidates/${selected.user.id}?job=${jobId}`} target="_blank"
                  className="w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-zinc-50 transition">
                  View Full Profile <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
              {busy && <div className="text-xs text-zinc-400 flex items-center gap-1.5 justify-center mt-2"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</div>}
            </div>

          </div>
        )}
      </aside>
    </div>
  );
}
