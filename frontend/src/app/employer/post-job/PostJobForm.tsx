"use client";
import { useMemo, useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, GraduationCap, Info, Loader2, MapPin, Wrench, X, Check, Eye, ChevronDown,
  ArrowLeft, Briefcase, BadgeDollarSign, TrendingUp, BadgeCheck, GraduationCap as GraduationCapIcon,
  Building2, Calendar, Wifi, Monitor, Tag, Star,
} from "lucide-react";
import { ManagedOptions } from "@/lib/job-option-types";
import { JobDescriptionEditor } from "@/components/JobDescriptionEditor";
import { RichText } from "@/components/RichText";

type Cat = { id: string; name: string };

const COLLAR_OPTIONS = [
  { value: "WHITE", label: "White Collar", emoji: "🏢", desc: "Corporate · Professional · Office Based Jobs", iconBg: "bg-blue-600",   activeBorder: "border-blue-500",   activeBg: "bg-blue-50",   activeText: "text-blue-700" },
  { value: "BLUE",  label: "Blue Collar",  emoji: "🔧", desc: "Skilled · Technical · Hands-on Jobs",           iconBg: "bg-teal-600",   activeBorder: "border-teal-500",   activeBg: "bg-teal-50",   activeText: "text-teal-700" },
  { value: "PINK",  label: "Diversity Job",emoji: "🌸", desc: "Inclusive · Equal Opportunity Jobs",            iconBg: "bg-pink-500",   activeBorder: "border-pink-500",   activeBg: "bg-pink-50",   activeText: "text-pink-700" },
  { value: "GREY",  label: "Others",       emoji: "⚙️", desc: "Other Job Categories",                          iconBg: "bg-zinc-500",   activeBorder: "border-zinc-500",   activeBg: "bg-zinc-100",  activeText: "text-zinc-700" },
];

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT",  label: "Contract" },
  { value: "INTERNSHIP",label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

const EDUCATION_META: Record<string, { desc: string; icon?: typeof GraduationCap; badge?: string }> = {
  "Post Graduate (PG)": { desc: "e.g. M.Tech, MBA, MCA, MSc, etc.", icon: GraduationCap },
  "Under Graduate (UG)": { desc: "e.g. B.Tech, B.Sc, B.Com, BA, etc.", icon: GraduationCap },
  "Diploma": { desc: "e.g. Diploma in Mechanical, Electrical, etc.", icon: FileText },
  "ITI Pass": { desc: "Industrial Training Institute (ITI)", icon: Wrench },
  "12th Pass": { desc: "HSC / Intermediate / 12th Pass", badge: "12" },
  "10th Pass": { desc: "SSC / Matriculation / 10th Pass", badge: "10" },
};

const DIPLOMA_SPECIALIZATIONS = [
  "Any Specialization",
  "Diploma in Mechanical Engineering",
  "Diploma in Electrical Engineering",
  "Diploma in Electronics Engineering",
  "Diploma in Civil Engineering",
  "Diploma in Computer Engineering",
  "Diploma in Automobile Engineering",
  "Diploma in Chemical Engineering",
  "Diploma in Information Technology",
  "Diploma in Pharmacy (D.Pharma)",
  "Diploma in Hotel Management",
  "Diploma in Fashion Designing",
  "Diploma in Interior Designing",
  "Diploma in Education (D.Ed)",
  "Post Graduate Diploma",
];

const UG_SPECIALIZATIONS = [
  "Any graduate",
  "B.Tech/B.E.",
  "B.Com",
  "B.Sc",
  "Bachelors of Arts",
  "B.C.A.",
  "M.B.B.S.",
  "B.B.A. / B.M.S.",
  "Bachelors of Dental Surgary",
  "B.Pharma",
  "LLB - Bachelors of Laws",
  "B.Ed",
  "B.Arch",
];

const PG_SPECIALIZATIONS = [
  "Any postgraduate",
  "MBA / PGDM",
  "M.Tech",
  "MS / M.Sc",
  "MCA",
  "M.COM",
  "M.B.B.S.",
  "PG Diploma",
  "M.A.",
  "CA",
  "CS",
  "ICWA (CMA)",
  "Integrated PG",
  "LLM",
  "M.Ed",
  "MDS",
  "DM (Doctor of Medicine) Fellowship",
  "Master of Human Resource Development",
];

const ITI_SPECIALIZATIONS = [
  "Any Specialization",
  "Attendant Operator (Chemical Plant)",
  "Civil and Mechanical Draughtsman",
  "Computer Operator and Programming Assistant",
  "Cosmetology",
  "Electrician",
  "Fashion Design and Technology",
  "Fitter",
  "Horticulture",
  "Information Communication Technology System Maintenance",
  "Machinist",
  "Mechanic",
  "Plumber",
  "Technician",
  "Welder",
];

const SectionHeader = ({ num, title }: { num: number; title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{num}</div>
    <h2 className="text-base font-bold text-zinc-900">{title}</h2>
  </div>
);

const inputCls = "w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white";

type DropdownOption = { value: string; label: string; sub?: string };

function SelectDropdown({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        className={`${inputCls} flex items-center justify-between gap-2 text-left`}
        onClick={() => setOpen(v => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      >
        <span className={`truncate ${selected ? "text-zinc-900" : "text-zinc-400"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200 bg-white py-2 shadow-xl">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="block w-full px-4 py-2.5 text-left transition hover:bg-blue-50"
            >
              <span className="block text-sm font-bold text-zinc-950">{o.label}</span>
              {o.sub && <span className="mt-0.5 block text-xs font-medium text-zinc-600">{o.sub}</span>}
            </button>
          ))}
          {!options.length && (
            <div className="px-4 py-3 text-sm font-medium text-zinc-500">No options available.</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatExperienceRange(min: string, max: string) {
  if (!min && !max) return undefined;
  if (min && max) return `${min}-${max} yrs`;
  if (min) return `${min}+ yrs`;
  return `Up to ${max} yrs`;
}

function getSeniorityFromExperience(min: string, max: string) {
  const n = parseInt(min || max || "", 10);
  if (Number.isNaN(n) || n <= 0) return "INTERN";
  if (n <= 2) return "ENTRY";
  if (n <= 5) return "MID";
  if (n <= 8) return "SENIOR";
  if (n <= 12) return "STAFF";
  if (n <= 15) return "PRINCIPAL";
  if (n <= 20) return "DIRECTOR";
  return "EXECUTIVE";
}

const SENIORITY_LABEL: Record<string, string> = {
  INTERN: "0-1 Years", ENTRY: "1-2 Years", MID: "2-5 Years", SENIOR: "3-5 Years",
  STAFF: "8-12 Years", PRINCIPAL: "12-15 Years", DIRECTOR: "15-20 Years", EXECUTIVE: "20+ Years",
};

function formatExperienceRangeYears(min: string, max: string, fallback: string) {
  const minN = min ? parseInt(min, 10) : null;
  const maxN = max ? parseInt(max, 10) : null;
  if (minN !== null && maxN !== null) return `${minN}-${maxN} Years`;
  if (minN !== null) return `${minN}+ Years`;
  if (maxN !== null) return `Up to ${maxN} Years`;
  return fallback;
}

function empTypeLabelOf(v: string) {
  return v === "FULL_TIME" ? "Full-time" : v === "PART_TIME" ? "Part-time" : v === "CONTRACT" ? "Contract" : v === "INTERNSHIP" ? "Internship" : v === "TEMPORARY" ? "Temporary" : "—";
}
function workModeLabelOf(v: string) {
  return v === "REMOTE" ? "Remote" : v === "HYBRID" ? "Hybrid" : "On-site";
}
function deptLabelOf(v: string) {
  return v === "WHITE" ? "Corporate & Professional" : v === "BLUE" ? "Operations & Trades" : v === "PINK" ? "Service & Support" : v === "GREY" ? "Technical & Supervisory" : "MSME & Entrepreneurship";
}

function isRichTextEmpty(html: string) {
  if (typeof document === "undefined") return !html.trim();
  const div = document.createElement("div");
  div.innerHTML = html;
  return !(div.textContent || "").trim();
}

function normalizeExperienceInput(value: string) {
  if (value === "") return "";
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return "";
  return String(Math.min(n, 60));
}

type Company = {
  name: string;
  logoUrl: string | null;
  description: string | null;
  headquarters: string | null;
  founded: number | null;
  verified: boolean;
} | null;

export function PostJobForm({ categories, options, isAdmin, company }: { categories: Cat[]; options: ManagedOptions; isAdmin: boolean; company: Company }) {
  const router = useRouter();

  const [collarTypes, setCollarTypes]     = useState<string[]>(["WHITE"]);
  const collarType = collarTypes[0] ?? "WHITE"; // primary for API
  const [title, setTitle]                 = useState("");
  const [categoryName, setCategoryName]   = useState("");
  const [industryName, setIndustryName]   = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [workMode, setWorkMode]           = useState("ONSITE");
  const [location, setLocation]           = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [remoteJob, setRemoteJob]         = useState(false);
  const [jobType, setJobType]             = useState("FULL_TIME");
  const [isMsme, setIsMsme]               = useState<"YES" | "NO" | null>(null);
  const [minEdus, setMinEdus]             = useState<string[]>([]);
  const [diplomaSpecialization, setDiplomaSpecialization] = useState("");
  const [ugSpecialization, setUgSpecialization]   = useState("");
  const [pgSpecialization, setPgSpecialization]   = useState("");
  const [itiSpecialization, setItiSpecialization] = useState("");
  const [description, setDescription]     = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements]   = useState("");
  const [salaryMin, setSalaryMin]         = useState("");
  const [salaryMax, setSalaryMax]         = useState("");
  const [salaryMinDisplay, setSalaryMinDisplay] = useState("");
  const [salaryMaxDisplay, setSalaryMaxDisplay] = useState("");

  const locationOptions = options.LOCATION;
  const industryOptions = options.INDUSTRY;
  const roleOptions = options.ROLE;
  const educationOptions = options.EDUCATION.map((o) => ({
    value: o.value,
    title: o.label,
    desc: EDUCATION_META[o.label]?.desc ?? "",
    icon: EDUCATION_META[o.label]?.icon,
    badge: EDUCATION_META[o.label]?.badge,
  }));
  const visibleLocationOptions = useMemo(() => {
    const query = location.trim().toLowerCase();
    const rows = query
      ? locationOptions.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(query))
      : locationOptions;
    return rows.slice(0, 30);
  }, [location, locationOptions]);
  const visibleRoleOptions = useMemo(() => {
    const query = title.trim().toLowerCase();
    const rows = query
      ? roleOptions.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(query))
      : roleOptions;
    return rows.slice(0, 30);
  }, [title, roleOptions]);

  function formatLPA(val: string): string {
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    return `${n} LPA`;
  }
  function sanitizeDecimalInput(val: string) {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot === -1) return cleaned;
    return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }
  function handleSalaryMin(val: string) {
    const clean = sanitizeDecimalInput(val);
    setSalaryMinDisplay(clean);
    const n = parseFloat(clean);
    setSalaryMin(isNaN(n) ? "" : String(Math.round(n * 100000)));
  }
  function handleSalaryMax(val: string) {
    const clean = sanitizeDecimalInput(val);
    setSalaryMaxDisplay(clean);
    const n = parseFloat(clean);
    setSalaryMax(isNaN(n) ? "" : String(Math.round(n * 100000)));
  }
  const [benefits, setBenefits]           = useState("");
  const [skills, setSkills]               = useState<string[]>([]);
  const [skillInput, setSkillInput]       = useState("");
  const skillRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [showPreview, setShowPreview]     = useState(false);

  function addSkill(val: string) {
    const t = val.trim();
    if (t && !skills.includes(t)) setSkills(s => [...s, t]);
    setSkillInput("");
  }
  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", "Tab"].includes(e.key)) { e.preventDefault(); addSkill(skillInput); }
    else if (e.key === "Backspace" && !skillInput && skills.length) setSkills(s => s.slice(0, -1));
  }

  function validate(): boolean {
    setError(null);

    // Client-side validation
    if (!title.trim() || title.trim().length < 3) {
      setError("Job title is required (minimum 3 characters)."); return false;
    }
    if (!categoryName.trim()) {
      setError("Job Role is required."); return false;
    }
    if (!employmentType) {
      setError("Employment Type is required."); return false;
    }
    if (!experienceMin || !experienceMax) {
      setError("Experience (Min and Max) is required."); return false;
    }
    if (!remoteJob && !location.trim()) {
      setError("Location is required. Or check 'Remote Job'."); return false;
    }
    if (isMsme === null) {
      setError("Please confirm whether your company is registered as MSME."); return false;
    }
    if (experienceMin && experienceMax && parseInt(experienceMin, 10) > parseInt(experienceMax, 10)) {
      setError("Minimum experience cannot be greater than maximum experience."); return false;
    }
    if (isRichTextEmpty(description)) {
      setError("About the Role is required."); return false;
    }
    if (isRichTextEmpty(responsibilities)) {
      setError("Roles & Responsibilities is required."); return false;
    }
    if (isRichTextEmpty(requirements)) {
      setError("Job Requirements is required."); return false;
    }
    if (!salaryMin || !salaryMax) {
      setError("CTC Range (Min and Max) is required."); return false;
    }
    if (salaryMin && salaryMax && parseInt(salaryMin, 10) > parseInt(salaryMax, 10)) {
      setError("Minimum CTC cannot be greater than maximum CTC."); return false;
    }
    return true;
  }

  function reviewJob() {
    if (!validate()) return;
    setShowPreview(true);
  }

  async function submit(status: "DRAFT" | "PENDING") {
    if (status === "PENDING" && !validate()) return;
    setError(null);
    setLoading(true);
    const seniority = getSeniorityFromExperience(experienceMin, experienceMax);
    const body = {
      title, description, responsibilities, requirements, benefits,
      location: remoteJob ? "Remote" : location,
      industry: industryName.trim() || undefined,
      workMode: remoteJob ? "REMOTE" : workMode,
      employmentType: employmentType || jobType || "FULL_TIME",
      seniority,
      experienceMin: experienceMin ? parseInt(experienceMin, 10) : undefined,
      experienceMax: experienceMax ? parseInt(experienceMax, 10) : undefined,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      salaryCurrency: "INR",
      salaryPeriod: "year",
      categoryName: categoryName.trim() || undefined,
      skills,
      collarType: collarType || "WHITE",
    };
    const res = await fetch("/api/employer/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed to post"); return; }
    if (status === "DRAFT") {
      router.push(isAdmin ? "/admin/jobs" : "/employer/jobs");
    } else {
      router.push(`/employer/jobs/${data.job.id}/preview`);
    }
    router.refresh();
  }

  const summaryFields = [
    { label: "Job Title",       value: title },
    { label: "Type of Industries", value: industryName },
    { label: "Job Role",        value: categoryName },
    { label: "Location",        value: remoteJob ? "Remote" : location },
    { label: "Employment Type", value: EMPLOYMENT_TYPES.find(e => e.value === (employmentType || jobType))?.label },
    { label: "Experience",      value: formatExperienceRange(experienceMin, experienceMax) },
    { label: "Work Mode",       value: remoteJob ? "Remote" : workMode.charAt(0) + workMode.slice(1).toLowerCase() },
    { label: "Education",       value: minEdus.length ? minEdus.join(", ") : undefined },
    { label: "CTC Range", value: salaryMinDisplay || salaryMaxDisplay ? `${salaryMinDisplay || "?"} – ${salaryMaxDisplay || "?"}` : undefined },
  ];

  return (
    <div className="flex gap-6 items-start">

      {/* ── MAIN FORM ── */}
      <div className="flex-1 min-w-0 space-y-5 pb-24">

        {/* 1. Job Type */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <SectionHeader num={1} title="Job Type / Category (Select One) *" />
          <p className="-mt-3 mb-5 text-sm text-zinc-500">Choose the type of job you are hiring for.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {COLLAR_OPTIONS.map(opt => {
              const active = collarTypes.includes(opt.value);
              return (
                <button key={opt.value} type="button" onClick={() => setCollarTypes([opt.value])}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${active ? `${opt.activeBg} ${opt.activeBorder} shadow-sm` : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                  <span className={`absolute top-2 right-2 h-4 w-4 rounded-full border flex items-center justify-center ${active ? "bg-blue-600 border-blue-600" : "border-zinc-300"}`}>
                    {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <div className={`h-11 w-11 rounded-xl ${opt.iconBg} grid place-items-center text-xl shadow`}>{opt.emoji}</div>
                  <span className={`text-sm font-bold leading-tight ${active ? opt.activeText : "text-zinc-900"}`}>{opt.label}</span>
                  <span className={`text-[11px] leading-tight ${active ? opt.activeText : "text-zinc-400"}`}>{opt.desc}</span>
                </button>
              );
            })}
          </div>

          <div className={`mt-6 rounded-xl border p-5 ${isMsme === null ? "border-red-200 bg-red-50/40" : "border-zinc-200"}`}>
            <p className="text-sm font-bold text-zinc-900">Is your company registered as MSME? <span className="text-red-500">*</span></p>
            <p className="mt-1 text-xs text-zinc-500">This helps us provide better visibility and support for MSME employers.</p>
            <div className="mt-4 flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isMsme" checked={isMsme === "YES"} onChange={() => setIsMsme("YES")} className="h-4 w-4 accent-blue-600" />
                <span className="text-sm text-zinc-700">Yes, we are an MSME</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isMsme" checked={isMsme === "NO"} onChange={() => setIsMsme("NO")} className="h-4 w-4 accent-blue-600" />
                <span className="text-sm text-zinc-700">No, we are not an MSME</span>
              </label>
            </div>
            {isMsme === null && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <Info className="h-3.5 w-3.5" /> This field is mandatory.
              </p>
            )}
          </div>
        </div>

        {/* 2. Job Information */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <SectionHeader num={2} title="Job Information" />
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                value={title}
                onChange={e => { setTitle(e.target.value); setShowTitleDropdown(true); }}
                onFocus={() => setShowTitleDropdown(true)}
                onBlur={() => window.setTimeout(() => setShowTitleDropdown(false), 120)}
                placeholder="e.g. Senior Software Engineer"
                data-testid="job-title"
              />
              {showTitleDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200 bg-white py-2 shadow-xl">
                  {visibleRoleOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setTitle(option.value);
                        setShowTitleDropdown(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left transition hover:bg-blue-50"
                    >
                      <span className="block text-sm font-bold text-zinc-950">{option.value}</span>
                      {option.label !== option.value && <span className="mt-0.5 block text-xs font-medium text-zinc-600">{option.label}</span>}
                    </button>
                  ))}
                  {!visibleRoleOptions.length && (
                    <div className="px-4 py-3 text-sm font-medium text-zinc-500">No matching role. You can type a custom title.</div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Type of Industries</label>
              <SelectDropdown
                value={industryName}
                onChange={setIndustryName}
                placeholder="Select type of industry"
                options={industryOptions.map(o => ({ value: o.value, label: o.label }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Job Role <span className="text-red-500">*</span></label>
              <SelectDropdown
                value={categoryName}
                onChange={setCategoryName}
                placeholder="Select job role"
                options={roleOptions.map(o => ({ value: o.value, label: o.label }))}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Employment Type <span className="text-red-500">*</span></label>
                <SelectDropdown
                  value={employmentType}
                  onChange={setEmploymentType}
                  placeholder="Select type"
                  options={EMPLOYMENT_TYPES.map(o => ({ value: o.value, label: o.label }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Experience <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    className={inputCls}
                    value={experienceMin}
                    onChange={e => setExperienceMin(normalizeExperienceInput(e.target.value))}
                    placeholder="Min"
                  />
                  <span className="text-xs font-semibold text-zinc-400">to</span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    className={inputCls}
                    value={experienceMax}
                    onChange={e => setExperienceMax(normalizeExperienceInput(e.target.value))}
                    placeholder="Max"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-400">Enter years, e.g. 2 to 5.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Work Mode <span className="text-red-500">*</span></label>
                <SelectDropdown
                  value={workMode}
                  onChange={setWorkMode}
                  placeholder="Select work mode"
                  options={[
                    { value: "ONSITE", label: "On-site" },
                    { value: "REMOTE", label: "Remote" },
                    { value: "HYBRID", label: "Hybrid" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Location & Job Type */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <SectionHeader num={3} title="Location & Job Type" />
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Job Location <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    className={inputCls}
                    value={location}
                    onChange={e => { setLocation(e.target.value); setShowLocationDropdown(true); }}
                    onFocus={() => !remoteJob && setShowLocationDropdown(true)}
                    onBlur={() => window.setTimeout(() => setShowLocationDropdown(false), 120)}
                    placeholder="e.g. Mumbai, India"
                    disabled={remoteJob}
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  {showLocationDropdown && !remoteJob && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-2 shadow-xl">
                      {visibleLocationOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setLocation(option.value);
                            setShowLocationDropdown(false);
                          }}
                          className="block w-full px-4 py-2.5 text-left transition hover:bg-blue-50"
                        >
                          <span className="block text-sm font-bold text-zinc-950">{option.value}</span>
                          {option.label !== option.value && <span className="mt-0.5 block text-xs font-medium text-zinc-600">{option.label}</span>}
                        </button>
                      ))}
                      {!visibleLocationOptions.length && (
                        <div className="px-4 py-3 text-sm font-medium text-zinc-500">No matching location. You can type a custom city.</div>
                      )}
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 whitespace-nowrap cursor-pointer">
                  <input type="checkbox" checked={remoteJob} onChange={e => setRemoteJob(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                  Remote Job
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Work Mode <span className="text-red-500">*</span></label>
              <div className="flex gap-5">
                {[{v:"ONSITE",l:"On-site"},{v:"REMOTE",l:"Remote"},{v:"HYBRID",l:"Hybrid"}].map(o => (
                  <label key={o.v} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="workMode" value={o.v} checked={workMode === o.v} onChange={() => setWorkMode(o.v)}
                      className="h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500" />
                    {o.l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Job Type <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-5">
                {EMPLOYMENT_TYPES.map(o => (
                  <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="jobType" value={o.value} checked={jobType === o.value} onChange={() => setJobType(o.value)}
                      className="h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500" />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Education Details */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-zinc-950">Education Details</h2>
          <p className="mt-3 text-sm font-medium text-zinc-500">
            Set the minimum education required for candidates.
          </p>

          <div className="mt-8 flex items-center gap-3 rounded-sm bg-blue-50 px-4 py-4 text-sm font-medium text-blue-700">
            <Info className="h-5 w-5 shrink-0" />
            <p>You can select academic qualifications such as 10th, 12th, ITI, Diploma, UG &amp; PG as minimum requirements.</p>
          </div>

          <div className="mt-8">
            <p className="text-base font-bold text-zinc-950">
              Minimum Education <span className="font-medium text-zinc-900">(Select one or more levels)</span>
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {educationOptions.map((option) => {
                const Icon = option.icon ?? null;
                const badge = option.badge ?? null;
                const selected = minEdus.includes(option.value);

                const specialization =
                  option.value === "Under Graduate (UG)" ? { label: "UG Education", options: UG_SPECIALIZATIONS, value: ugSpecialization, set: setUgSpecialization } :
                  option.value === "Post Graduate (PG)"  ? { label: "PG Education", options: PG_SPECIALIZATIONS, value: pgSpecialization, set: setPgSpecialization } :
                  option.value === "Diploma"              ? { label: "Diploma Education", options: DIPLOMA_SPECIALIZATIONS, value: diplomaSpecialization, set: setDiplomaSpecialization } :
                  option.value === "ITI Pass"             ? { label: "ITI Education", options: ITI_SPECIALIZATIONS, value: itiSpecialization, set: setItiSpecialization } :
                  null;

                return (
                  <div key={option.value} className="contents">
                    <button
                      type="button"
                      onClick={() => setMinEdus(prev => prev.includes(option.value) ? prev.filter(v => v !== option.value) : [...prev, option.value])}
                      className={`flex min-h-[88px] w-full items-center gap-5 rounded-xl border bg-white px-5 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                        selected ? "border-blue-400 ring-2 ring-blue-100" : "border-zinc-200"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        {Icon ? <Icon className="h-6 w-6" /> : badge ? <span className="text-lg font-bold leading-none">{badge}</span> : <GraduationCap className="h-6 w-6" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-zinc-950">{option.title}</span>
                        <span className="mt-1 block text-sm font-medium leading-5 text-zinc-500">{option.desc}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                          selected ? "bg-blue-600 border-blue-600" : "border-zinc-400"
                        }`}
                        aria-hidden="true"
                      >
                        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                      </span>
                    </button>

                    {selected && specialization && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{specialization.label}</label>
                        <SelectDropdown
                          value={specialization.value}
                          onChange={specialization.set}
                          placeholder={`Select ${specialization.label.split(" ")[0]} specialization`}
                          options={specialization.options.map(o => ({ value: o, label: o }))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Job Description */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <SectionHeader num={5} title="Job Description" />
          <p className="mb-8 text-sm font-medium text-zinc-500">
            Provide a clear and complete job description to attract the right candidates.
          </p>
          <div className="space-y-5">
            {[
              {
                number: 1,
                label: "About the Role",
                helper: "Share an overview of the role, key responsibilities and expectations.",
                value: description,
                set: setDescription,
                placeholder: "Write a complete description about the role, responsibilities and expectations...",
              },
              {
                number: 2,
                label: "Roles & Responsibilities",
                helper: "Provide a detailed explanation of the key tasks and responsibilities for this position.",
                value: responsibilities,
                set: setResponsibilities,
                placeholder: "Describe the key tasks, daily activities, responsibilities and deliverables...",
              },
              {
                number: 3,
                label: "Job Requirements",
                helper: "Describe the skills, experience, knowledge and other requirements for candidates.",
                value: requirements,
                set: setRequirements,
                placeholder: "Mention the required skills, experience, knowledge, qualifications and any other criteria...",
              },
            ].map(({ number, label, helper, value, set, placeholder }) => (
              <JobDescriptionEditor
                key={label}
                number={number}
                title={label}
                helper={helper}
                value={value}
                onChange={set}
                placeholder={placeholder}
              />
            ))}

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Skills <span className="text-xs font-normal text-zinc-400">(type &amp; press Enter or comma)</span></label>
              <div
                className="min-h-[48px] w-full px-3 py-2 border border-zinc-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition flex flex-wrap gap-2 cursor-text bg-white"
                onClick={() => skillRef.current?.focus()}
              >
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                    {s}
                    <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={skillRef}
                  className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-zinc-400"
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey}
                  onBlur={() => skillInput.trim() && addSkill(skillInput)}
                  placeholder={skills.length === 0 ? "React, TypeScript, Node.js..." : "Add more..."}
                />
              </div>
              {skills.length > 0 && <p className="text-xs text-zinc-400 mt-1">{skills.length} skill{skills.length > 1 ? "s" : ""} added</p>}
            </div>
          </div>
        </div>

        {/* 6. Compensation */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <SectionHeader num={6} title="Compensation" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                CTC Range <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-zinc-400">Enter in LPA (e.g. 5.5 = 5.5 LPA)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputCls}
                    value={salaryMinDisplay}
                    onChange={e => handleSalaryMin(e.target.value)}
                    onBlur={e => { if (e.target.value) setSalaryMinDisplay(formatLPA(e.target.value)); }}
                    onFocus={e => { const raw = parseFloat(salaryMin) / 100000; setSalaryMinDisplay(isNaN(raw) ? "" : String(raw)); }}
                    placeholder="Min CTC"
                  />
                </div>
                <span className="text-zinc-400 text-sm font-medium shrink-0">to</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputCls}
                    value={salaryMaxDisplay}
                    onChange={e => handleSalaryMax(e.target.value)}
                    onBlur={e => { if (e.target.value) setSalaryMaxDisplay(formatLPA(e.target.value)); }}
                    onFocus={e => { const raw = parseFloat(salaryMax) / 100000; setSalaryMaxDisplay(isNaN(raw) ? "" : String(raw)); }}
                    placeholder="Max CTC"
                  />
                </div>
              </div>
              {salaryMin && salaryMax && parseInt(salaryMin, 10) > parseInt(salaryMax, 10) ? (
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  ✕ Minimum CTC cannot be greater than maximum CTC.
                </p>
              ) : (salaryMinDisplay || salaryMaxDisplay) && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                  ✓ CTC: {salaryMinDisplay ? formatLPA(salaryMinDisplay.replace(" LPA","")) : "?"} – {salaryMaxDisplay ? formatLPA(salaryMaxDisplay.replace(" LPA","")) : "?"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Additional Benefits</label>
              <textarea
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                value={benefits} onChange={e => setBenefits(e.target.value)}
                placeholder="e.g. Health Insurance, Flexible Hours, Bonus, etc."
                rows={2} />
              <p className="mt-1 text-xs text-zinc-400">Separate benefits with commas.</p>
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="w-72 shrink-0 sticky top-6 space-y-5 hidden lg:block">

        {/* Job Summary */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Job Summary</h3>
          <div className="space-y-3">
            {summaryFields.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2 text-sm">
                <span className="text-zinc-500 shrink-0">{label}</span>
                <span className={`font-medium text-right ${value ? "text-zinc-900" : "text-zinc-300"}`}>{value || "Not added"}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 text-blue-600 text-sm font-semibold hover:underline"
          >
            <Eye className="h-4 w-4" /> Preview Full Job
          </button>
        </div>

        {/* Posting Tips */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-3">Posting Tips</h3>
          <ul className="space-y-2.5 text-sm text-zinc-600">
            {[
              "Write a clear and specific job title.",
              "Describe responsibilities in detail.",
              "Add must-have skills and qualifications.",
              "Include salary range to attract relevant candidates.",
              "Review before publishing to ensure accuracy.",
            ].map(tip => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR (fixed) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">Review your job before publishing — you can edit anytime from My Jobs.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => submit("DRAFT")}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={reviewJob}
            data-testid="submit-job"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            <Eye className="h-4 w-4" />
            Preview Job
          </button>
        </div>
      </div>

      {/* ── PREVIEW OVERLAY (client-only, no network calls) ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setShowPreview(false)}>
          <div
            className="h-full w-full max-w-3xl overflow-y-auto bg-zinc-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Edit Job
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => submit("PENDING")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isAdmin ? "Publish Job" : "Submit for Review"}
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-black text-zinc-900">Preview Your Job</h1>
                <p className="text-sm text-zinc-400 mt-0.5">This is how your job post will appear to candidates. Nothing has been saved yet.</p>
              </div>

              {/* Job Header Card */}
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    {empTypeLabelOf(employmentType || jobType)}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-zinc-900">{title || "Untitled Job"}</h2>

                <div className="mt-2 flex items-center gap-2">
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="" className="h-6 w-6 rounded object-contain border border-zinc-100" />
                  ) : (
                    <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {(company?.name || "Y")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-zinc-800 text-sm">{company?.name || "Your Company"}</span>
                  {company?.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {remoteJob ? "Remote" : (location || "—")}</span>
                  <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> {remoteJob ? "Remote" : workModeLabelOf(workMode)}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: <TrendingUp className="h-4 w-4 text-blue-500" />, label: "Experience",       value: formatExperienceRangeYears(experienceMin, experienceMax, SENIORITY_LABEL[getSeniorityFromExperience(experienceMin, experienceMax)]) },
                    { icon: <Briefcase className="h-4 w-4 text-blue-500" />,  label: "Employment Type", value: empTypeLabelOf(employmentType || jobType) },
                    { icon: <Wifi className="h-4 w-4 text-blue-500" />,       label: "Work Mode",       value: remoteJob ? "Remote" : workModeLabelOf(workMode) },
                    { icon: <Tag className="h-4 w-4 text-blue-500" />,        label: "Department",      value: categoryName || deptLabelOf(collarType) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-zinc-50 rounded-xl p-3 flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div>
                        <div className="text-[11px] text-zinc-400 font-semibold">{label}</div>
                        <div className="text-xs font-bold text-zinc-900 mt-0.5">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isRichTextEmpty(description) && (
                <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-900 mb-3">About the Role</h3>
                  <RichText value={description} className="text-sm text-zinc-600 leading-relaxed" />
                </div>
              )}

              {!isRichTextEmpty(responsibilities) && (
                <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-900 mb-3">Roles &amp; Responsibilities</h3>
                  <RichText value={responsibilities} className="text-sm text-zinc-600 leading-relaxed" />
                </div>
              )}

              {!isRichTextEmpty(requirements) && (
                <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-900 mb-3">Job Requirements</h3>
                  <RichText value={requirements} className="text-sm text-zinc-600 leading-relaxed" />
                </div>
              )}

              {/* Education */}
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <GraduationCapIcon className="h-4 w-4 text-blue-600" /> Education
                </h3>
                <p className="text-sm font-medium text-zinc-700">{minEdus.length ? minEdus.join(", ") : "Not specified"}</p>
              </div>

              {/* Job Details Grid */}
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {[
                    { icon: <Tag className="h-4 w-4 text-blue-500" />,         label: "Job Role",           value: categoryName || "—" },
                    { icon: <Tag className="h-4 w-4 text-blue-500" />,         label: "Type of Industries", value: industryName || "—" },
                    { icon: <BadgeDollarSign className="h-4 w-4 text-blue-500" />, label: "Salary Range",   value: (salaryMinDisplay || salaryMaxDisplay) ? `${salaryMinDisplay || "?"} – ${salaryMaxDisplay || "?"} LPA` : "Not specified" },
                    { icon: <Wifi className="h-4 w-4 text-blue-500" />,        label: "Work Mode",          value: remoteJob ? "Remote" : workModeLabelOf(workMode) },
                    { icon: <Star className="h-4 w-4 text-blue-500" />,        label: "Additional Benefits",value: benefits || "—" },
                    { icon: <MapPin className="h-4 w-4 text-blue-500" />,      label: "Job Location",       value: remoteJob ? "Remote" : (location || "—") },
                    { icon: <Tag className="h-4 w-4 text-blue-500" />,         label: "Department",         value: deptLabelOf(collarType) },
                    ...(remoteJob ? [{ icon: <Wifi className="h-4 w-4 text-blue-500" />, label: "Remote Job", value: "Available" }] : []),
                    { icon: <Calendar className="h-4 w-4 text-blue-500" />,    label: "Posted On",          value: "Not yet posted" },
                    { icon: <TrendingUp className="h-4 w-4 text-blue-500" />,  label: "Experience Level",   value: formatExperienceRangeYears(experienceMin, experienceMax, SENIORITY_LABEL[getSeniorityFromExperience(experienceMin, experienceMax)]) },
                    { icon: <Calendar className="h-4 w-4 text-blue-500" />,    label: "Application Deadline",value: "Not Specified" },
                    { icon: <Briefcase className="h-4 w-4 text-blue-500" />,   label: "Employment Type",    value: empTypeLabelOf(employmentType || jobType) },
                    { icon: <Briefcase className="h-4 w-4 text-blue-500" />,   label: "Job Type",           value: empTypeLabelOf(jobType) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div>
                        <div className="text-zinc-400 text-xs font-semibold">{label}</div>
                        <div className="text-zinc-800 font-medium mt-0.5">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* About Company */}
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 mb-4">About Company</h3>
                <div className="flex items-start gap-4">
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="" className="h-14 w-14 rounded-xl object-contain border border-zinc-100 shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl shrink-0">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 text-base">{company?.name || "Your Company"}</span>
                      {company?.verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                    </div>
                    {company?.description ? (
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed line-clamp-3">{company.description}</p>
                    ) : (
                      <p className="text-sm text-zinc-500 mt-1">Company details will appear here as they do on your public profile.</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                      {company?.founded && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {company.founded}+ Years</span>}
                      {company?.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {company.headquarters}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
