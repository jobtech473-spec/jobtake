"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Loader2, FileDown, Search, SlidersHorizontal, MapPin, Bookmark, ArrowRight, ArrowLeft, ExternalLink, Mail, MessageCircle } from "lucide-react";
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

const DEMO_EXP: Record<string, { title: string; company: string }> = {
  "d1": { title: "Digital Marketing Executive", company: "Tech Solutions Pvt. Ltd." },
  "d2": { title: "SEO Specialist", company: "DigitalBoost Agency" },
  "d3": { title: "Growth Marketer", company: "StartupXYZ" },
  "d4": { title: "Brand Manager", company: "FMCG Corp Ltd." },
  "d5": { title: "Social Media Executive", company: "Creative Studio" },
  "d6": { title: "Performance Marketer", company: "AdTech Solutions" },
};

const DEMO_EDU: Record<string, { degree: string; school: string }> = {
  "d1": { degree: "Bachelor of Business Administration", school: "University of Mumbai" },
  "d2": { degree: "Bachelor of Computer Applications", school: "Delhi University" },
  "d3": { degree: "MBA - Marketing", school: "IIM Bangalore" },
  "d4": { degree: "Bachelor of Management Studies", school: "NMIMS Mumbai" },
  "d5": { degree: "Bachelor of Arts - Media", school: "Gujarat University" },
  "d6": { degree: "B.Tech - Computer Science", school: "JNTU Hyderabad" },
};

export function ApplicantsBoard({ applications, jobId }: { applications: App[]; jobId: string; jobTitle?: string }) {
  const router = useRouter();
  const isDemo = applications.length === 0;
  const list = isDemo ? DEMO_APPLICANTS : applications;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [localStages, setLocalStages] = useState<Record<string, Stage>>({});
  const [localRatings, setLocalRatings] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const filtered = list.filter(a =>
    !search ||
    a.user.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.user.headline ?? "").toLowerCase().includes(search.toLowerCase()) ||
    a.user.email.toLowerCase().includes(search.toLowerCase())
  );

  async function updateStage(id: string, stage: Stage) {
    setLocalStages(s => ({ ...s, [id]: stage }));
    if (isDemo) return;
    setBusyId(id);
    await fetch(`/api/employer/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function setRating(id: string, rating: number) {
    setLocalRatings(r => ({ ...r, [id]: rating }));
    if (isDemo) return;
    setBusyId(id);
    await fetch(`/api/employer/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating }),
    });
    setBusyId(null);
    router.refresh();
  }

  const expYears = (h: string | null) => {
    const m = (h ?? "").match(/(\d+)\s*yr/);
    return m ? `${m[1]} yrs exp` : null;
  };

  return (
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

      {/* Applicant cards */}
      {filtered.map((a, i) => {
        const initials = a.user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const exp = a.user.yearsExperience ? `${a.user.yearsExperience} yrs exp` : expYears(a.user.headline);
        const demoExp = DEMO_EXP[a.user.id];
        const demoEdu = DEMO_EDU[a.user.id];
        const current = a.user.experiences?.find(e => e.current) ?? a.user.experiences?.[0]
          ?? (demoExp ? { title: demoExp.title, company: demoExp.company, current: true } : undefined);
        const previous = a.user.experiences?.find(e => e !== current);
        const education = a.user.educations?.[0] ?? (demoEdu ? { degree: demoEdu.degree, field: null, school: demoEdu.school } : undefined);
        const skills = a.user.skills ?? DEMO_SKILLS[a.user.id] ?? [];
        const stage = localStages[a.id] ?? a.stage;
        const rating = localRatings[a.id] ?? a.rating ?? 0;
        const busy = busyId === a.id;

        return (
          <div key={a.id} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm" data-testid={`applicant-${a.id}`}>
            <div className="flex items-start gap-4">
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
                  {stage === "APPLIED" && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase">New</span>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STAGE_BADGE[stage]}`}>{STAGE_LABEL[stage]}</span>
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
              {/* Applied + Match */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                <div className="text-xs text-zinc-400">Applied {timeAgo(a.createdAt)}</div>
                {a.matchScore && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${MATCH_COLOR(a.matchScore)}`}>{a.matchScore}% Match</span>
                )}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} disabled={busy} onClick={() => setRating(a.id, n)} data-testid={`rate-${a.id}-${n}`}>
                      <Star className={`h-3.5 w-3.5 transition-colors ${rating >= n ? "text-amber-400 fill-amber-400" : "text-zinc-200 hover:text-amber-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current / Previous / Education / Pref locations / Skills */}
            {(current || previous || education || skills.length > 0 || (a.user.preferredLocations && a.user.preferredLocations.length > 0)) && (
              <div className="mt-3 pt-3 border-t border-zinc-50 pl-16 space-y-1.5 text-xs">
                {current && (
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-semibold w-24 shrink-0">Current</span>
                    <span className="text-zinc-600">{current.title} at {current.company}</span>
                  </div>
                )}
                {previous && (
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-semibold w-24 shrink-0">Previous</span>
                    <span className="text-zinc-600">{previous.title} at {previous.company}</span>
                  </div>
                )}
                {education && (
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-semibold w-24 shrink-0">Education</span>
                    <span className="text-zinc-600">{education.degree}{education.field ? ` in ${education.field}` : ""}, {education.school}</span>
                  </div>
                )}
                {a.user.preferredLocations && a.user.preferredLocations.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-semibold w-24 shrink-0">Pref. locations</span>
                    <span className="text-zinc-600">{a.user.preferredLocations.join(", ")}</span>
                  </div>
                )}
                {skills.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-zinc-400 font-semibold w-24 shrink-0">Key skills</span>
                    <span className="text-zinc-600">{skills.join(" | ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* About / Cover letter / Resume */}
            {(a.user.bio || a.coverLetter || a.resumeUrl) && (
              <div className="mt-3 pt-3 border-t border-zinc-50 pl-16 space-y-2 text-xs">
                {a.user.bio && <p className="text-zinc-600 leading-relaxed">{a.user.bio}</p>}
                {a.coverLetter && <p className="text-zinc-600 leading-relaxed line-clamp-3">&ldquo;{a.coverLetter}&rdquo;</p>}
                {a.resumeUrl && (
                  <a href={a.resumeUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-zinc-200 text-zinc-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition">
                    <FileDown className="h-3.5 w-3.5" /> View Resume
                  </a>
                )}
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {a.user.email && (
                  <a href={`mailto:${a.user.email}`} title="Email"
                    className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700">
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                )}
                {a.user.phone && (
                  <a href={`https://wa.me/${a.user.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" title="WhatsApp"
                    className="h-7 w-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-emerald-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
                <select value={stage} onChange={e => updateStage(a.id, e.target.value as Stage)} disabled={busy}
                  className="text-xs font-semibold border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 bg-white">
                  {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                </select>
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
              </div>
              <div className="flex items-center gap-2">
                {isDemo ? (
                  <button disabled className="text-xs font-semibold text-zinc-300 px-3 py-1.5 cursor-not-allowed">
                    View Full Profile
                  </button>
                ) : (
                  <Link href={`/employer/candidates/${a.user.id}?job=${jobId}`} target="_blank"
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 transition">
                    View Full Profile <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
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
  );
}
