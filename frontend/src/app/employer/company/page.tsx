import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2, Palette, FileText, MapPin, Gift, Users,
  ImageIcon, Share2, CheckCircle2, Circle, ArrowRight,
  Linkedin, Facebook, Instagram, Twitter, Globe,
} from "lucide-react";

export default async function CompanyProfilePage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") redirect("/employers/login");

  const company = await prisma.company.findFirst({
    where: { ownerId: me.id },
    orderBy: { createdAt: "asc" },
    include: { benefits: true },
  });

  // Completion logic
  const checks = {
    "Company Information": !!(company?.name && company?.industry && company?.size && company?.founded && company?.website),
    "Branding":            !!(company?.logoUrl || company?.bannerUrl),
    "About Company":       !!(company?.description && company?.missionVision && company?.whyJoinUs && company?.workCulture),
    "Locations":           !!(company?.headquarters),
    "Benefits & Perks":    !!(company?.benefits?.length),
    "Team & Culture":      !!(company?.teamSize && company?.workCulture),
    "Gallery":             !!(company?.galleryUrls?.length),
    "Social Presence":     !!(company?.linkedinUrl || company?.facebookUrl || company?.instagramUrl || company?.twitterUrl),
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;
  const pct = Math.round((completedCount / totalCount) * 100);

  const initial = company?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <DashboardShell role="EMPLOYER" current="/employer/company">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">

        {/* â”€â”€ MAIN â”€â”€ */}
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400 font-semibold">Company Profile</div>
              <h1 className="text-3xl font-black text-zinc-900 mt-1">Build your employer brand</h1>
              <p className="text-sm text-zinc-500 mt-2 max-w-xl">
                Complete your company profile to build trust with candidates and showcase your organization professionally. A complete profile attracts more applications.
              </p>
            </div>
            <Link
              href={`/companies`}
              className="shrink-0 inline-flex items-center gap-2 border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
            >
              <Globe className="h-4 w-4" /> Preview Public Profile
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Company Information */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Company Information</div>
                    <div className="text-xs text-zinc-400">Basic details about your company</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["Company Information"] ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                  {checks["Company Information"] ? "Completed" : "Incomplete"}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                {["Company Name", "Industry", "Company Size", "Founded Year", "Website"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-zinc-600">
                    <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${checks["Company Information"] ? "text-emerald-500" : "text-zinc-300"}`} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/employer/company/edit#info" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Edit Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Branding */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Branding</div>
                    <div className="text-xs text-zinc-400">Showcase your brand identity</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["Branding"] ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {checks["Branding"] ? "Completed" : "40% Completed"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Logo</div>
                  <div className="h-16 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                    {company?.logoUrl ? (
                      <img src={company.logoUrl} alt="logo" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-2xl font-black text-zinc-400">{initial}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Banner</div>
                  <div className="h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {company?.bannerUrl ? (
                      <img src={company.bannerUrl} alt="banner" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-zinc-300" />
                    )}
                  </div>
                </div>
              </div>
              <Link href="/employer/company/edit#branding" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Edit Branding <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* About Company */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">About Company</div>
                    <div className="text-xs text-zinc-400">Tell candidates about your company</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["About Company"] ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                  {checks["About Company"] ? "Completed" : "Incomplete"}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                {[
                  ["Company Overview", !!company?.description],
                  ["Mission & Vision", !!company?.missionVision],
                  ["Why Join Us", !!company?.whyJoinUs],
                  ["Work Culture", !!company?.workCulture],
                ].map(([item, done]) => (
                  <li key={item as string} className="flex items-center gap-2 text-zinc-600">
                    {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300" />}
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/employer/company/edit#about" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Add Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Locations</div>
                    <div className="text-xs text-zinc-400">Where your team is based</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["Locations"] ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                  {checks["Locations"] ? "Completed" : "Incomplete"}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                {[
                  ["Head Office", !!company?.headquarters],
                  ["Branch Offices", !!company?.branchOffices?.length],
                ].map(([item, done]) => (
                  <li key={item as string} className="flex items-center gap-2 text-zinc-600">
                    {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300" />}
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/employer/company/edit#locations" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Manage Locations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Benefits & Perks */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Benefits &amp; Perks</div>
                    <div className="text-xs text-zinc-400">Highlight what makes you great</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["Benefits & Perks"] ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                  {checks["Benefits & Perks"] ? "Completed" : "Incomplete"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {company?.benefits?.length ? company.benefits.slice(0, 4).map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {b.label}
                  </div>
                )) : <div className="text-xs text-zinc-400">No benefits added yet.</div>}
              </div>
              <Link href="/employer/company/edit#benefits" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Manage Benefits <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Team & Culture */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Team &amp; Culture</div>
                    <div className="text-xs text-zinc-400">Showcase your amazing team</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checks["Team & Culture"] ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"}`}>
                  {checks["Team & Culture"] ? "Completed" : "Incomplete"}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm mb-4">
                {[
                  ["Team Size", !!company?.teamSize],
                  ["Culture", !!company?.workCulture],
                  ["Office / Team Photos", !!company?.galleryUrls?.length],
                ].map(([item, done]) => (
                  <li key={item as string} className="flex items-center gap-2 text-zinc-600">
                    {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300" />}
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/employer/company/edit#team" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Add Photos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Social Presence */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Social Presence</div>
                    <div className="text-xs text-zinc-400">Add your social and web links</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-400">Optional</span>
              </div>
              <ul className="space-y-2 text-sm mb-4">
                {[
                  { icon: Linkedin, label: "LinkedIn", value: company?.linkedinUrl },
                  { icon: Facebook, label: "Facebook", value: company?.facebookUrl },
                  { icon: Instagram, label: "Instagram", value: company?.instagramUrl },
                  { icon: Twitter, label: "Twitter / X", value: company?.twitterUrl },
                  { icon: Globe, label: "Website", value: company?.website },
                ].map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-zinc-600"><Icon className="h-3.5 w-3.5 text-zinc-400" /> {label}</span>
                    <Link href="/employer/company/edit#social" className="text-xs font-semibold text-blue-600 hover:underline">{value ? "Edit link" : "Add link"}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 md:col-span-2">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">Gallery</div>
                    <div className="text-xs text-zinc-400">Show your workplace and culture</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {Array.from({ length: 4 }).map((_, i) => {
                  const url = company?.galleryUrls?.[i];
                  return (
                    <div key={i} className="aspect-square rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-zinc-300" />}
                    </div>
                  );
                })}
              </div>
              <Link href="/employer/company/edit#gallery" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Upload More Images <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>

        {/* â”€â”€ RIGHT SIDEBAR â”€â”€ */}
        <aside className="space-y-4 lg:sticky lg:top-6 h-fit">

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="font-bold text-zinc-900 mb-4">Profile Completion</div>
            <div className="flex items-center gap-4 mb-4">
              {/* Circle progress */}
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#2563eb" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-base font-black text-zinc-900">{pct}%</div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">Complete your profile to increase visibility and attract more candidates.</p>
            </div>
            <Link href="/employer/company/edit" className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
              Continue Setup
            </Link>
          </div>

          {/* Progress checklist */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="font-bold text-zinc-900 mb-3">Your Progress</div>
            <ul className="space-y-2.5">
              {Object.entries(checks).map(([label, done]) => (
                <li key={label} className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  <span className={`text-sm ${done ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="font-bold text-zinc-900 mb-3">Preview Your Profile</div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black text-lg mb-3">
                {initial}
              </div>
              <div className="font-bold text-zinc-900 text-sm">{company?.name ?? "Your Company"}</div>
              {company?.verified && (
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Verified Employer</span>
              )}
              <div className="mt-3 space-y-1 text-xs text-zinc-500">
                {company?.industry && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {company.industry}</div>}
                {company?.size && <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {company.size} Employees</div>}
                {company?.headquarters && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {company.headquarters}</div>}
              </div>
            </div>
            <Link href="/companies" className="mt-3 w-full flex items-center justify-center gap-1.5 border border-zinc-200 text-zinc-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
              View Public Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </aside>
      </div>
    </DashboardShell>
  );
}
