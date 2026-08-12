import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import {
  Building2, BadgeCheck, Globe, MapPin, Users, Calendar,
  Briefcase, Sparkles, Heart, Linkedin, Facebook, Instagram, Twitter,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      benefits: true,
      jobs: {
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        include: { category: { select: { name: true } } },
      },
    },
  });

  if (!company || company.status !== "ACTIVE") notFound();

  const initial = company.name[0]?.toUpperCase() ?? "?";
  const socials = [
    { url: company.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: company.facebookUrl, icon: Facebook, label: "Facebook" },
    { url: company.instagramUrl, icon: Instagram, label: "Instagram" },
    { url: company.twitterUrl, icon: Twitter, label: "Twitter / X" },
  ].filter((s) => s.url);

  return (
    <main className="min-h-screen bg-white">
      <PublicNav />

      {/* Banner */}
      <div className="pt-20">
        {company.bannerUrl ? (
          <div className="h-48 md:h-64 w-full bg-zinc-100">
            <img src={company.bannerUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-32 md:h-40 w-full bg-gradient-to-r from-blue-50 to-indigo-50" />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Header card */}
        <div className="-mt-12 md:-mt-16 relative bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-contain border border-zinc-100 bg-white shrink-0 -mt-2" />
            ) : (
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-3xl font-black shrink-0 -mt-2">
                {initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900">{company.name}</h1>
                {company.verified && <BadgeCheck className="h-6 w-6 text-blue-500 shrink-0" />}
              </div>
              {company.tagline && <p className="text-zinc-600 mt-1">{company.tagline}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                {company.industry && (
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {company.industry}</span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {company.size} Employees</span>
                )}
                {company.headquarters && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {company.headquarters}</span>
                )}
                {company.founded && (
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Founded {company.founded}</span>
                )}
                {company.website && (
                  <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
              </div>

              {socials.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  {socials.map(({ url, icon: Icon, label }) => (
                    <a key={label} href={url!} target="_blank" rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 flex md:flex-col items-center md:items-end gap-3">
              <div className="text-center md:text-right bg-blue-50 rounded-xl px-4 py-2.5">
                <div className="text-xl font-black text-blue-700">{company.jobs.length}</div>
                <div className="text-xs font-semibold text-blue-600">Open Role{company.jobs.length === 1 ? "" : "s"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6 pb-20">
          {/* Left column */}
          <div className="space-y-5 min-w-0">
            {company.description && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3">About {company.name}</h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.description}</p>
              </section>
            )}

            {company.missionVision && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" /> Mission &amp; Vision</h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.missionVision}</p>
              </section>
            )}

            {company.whyJoinUs && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3">Why Join Us</h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.whyJoinUs}</p>
              </section>
            )}

            {company.workCulture && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3">Work Culture</h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.workCulture}</p>
              </section>
            )}

            {company.benefits.length > 0 && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Benefits &amp; Perks</h2>
                <div className="flex flex-wrap gap-2">
                  {company.benefits.map((b) => (
                    <span key={b.id} className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      {b.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {company.galleryUrls.length > 0 && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {company.galleryUrls.map((url) => (
                    <div key={url} className="aspect-square rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {company.branchOffices.length > 0 && (
              <section className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" /> Locations</h2>
                <div className="space-y-2 text-sm text-zinc-600">
                  {company.headquarters && <div><span className="font-semibold text-zinc-800">Head Office:</span> {company.headquarters}</div>}
                  {company.branchOffices.map((office) => (
                    <div key={office}>{office}</div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column — open roles */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" /> Open Roles
              </h2>
              {company.jobs.length === 0 ? (
                <p className="text-sm text-zinc-400">No open roles right now. Check back soon.</p>
              ) : (
                <div className="space-y-3">
                  {company.jobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`} className="block rounded-xl border border-zinc-100 p-3.5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                      <div className="font-semibold text-sm text-zinc-900">{job.title}</div>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                        {job.category?.name && <span>{job.category.name}</span>}
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                      {job.publishedAt && <div className="text-[11px] text-zinc-400 mt-1">Posted {timeAgo(job.publishedAt)}</div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
