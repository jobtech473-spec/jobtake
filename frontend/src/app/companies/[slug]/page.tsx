import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import {
  Building2, BadgeCheck, Globe, MapPin, Users, Calendar,
  Briefcase, Sparkles, Heart, Linkedin, Facebook, Instagram, Twitter,
  Image as ImageIcon, Info,
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

  const facts = [
    company.industry && { icon: Building2, text: company.industry },
    company.size && { icon: Users, text: `${company.size} Employees` },
    company.headquarters && { icon: MapPin, text: company.headquarters },
    company.founded && { icon: Calendar, text: `Founded ${company.founded}` },
  ].filter(Boolean) as { icon: typeof Building2; text: string }[];

  const hasAboutContent = Boolean(company.description || company.missionVision || company.whyJoinUs || company.workCulture);

  return (
    <main className="min-h-screen bg-zinc-50">
      <PublicNav />

      {/* Banner */}
      <div className="pt-20">
        {company.bannerUrl ? (
          <div className="h-48 md:h-64 w-full bg-zinc-100">
            <img src={company.bannerUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-40 md:h-52 w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)" }} />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Header card */}
        <div className="-mt-14 md:-mt-20 relative bg-white rounded-2xl border border-zinc-100 shadow-lg shadow-zinc-200/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-contain border-4 border-white shadow-md bg-white shrink-0 -mt-2" />
            ) : (
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-white text-4xl font-black shrink-0 -mt-2 border-4 border-white shadow-md">
                {initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900">{company.name}</h1>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              {company.tagline ? (
                <p className="text-zinc-600 mt-1.5">{company.tagline}</p>
              ) : (
                <p className="text-zinc-400 mt-1.5 italic">Hiring on Jobtake</p>
              )}

              {facts.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                  {facts.map(({ icon: Icon, text }, i) => (
                    <span key={i} className="flex items-center gap-1.5"><Icon className="h-4 w-4 text-zinc-400" /> {text}</span>
                  ))}
                  {company.website && (
                    <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
                      <Globe className="h-4 w-4" /> Visit website
                    </a>
                  )}
                </div>
              )}

              {socials.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  {socials.map(({ url, icon: Icon, label }) => (
                    <a key={label} href={url!} target="_blank" rel="noopener noreferrer" title={label}
                      className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 flex md:flex-col items-center md:items-end gap-3">
              <div className="text-center md:text-right bg-blue-50 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black text-blue-700 leading-none">{company.jobs.length}</div>
                <div className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wide">Open Role{company.jobs.length === 1 ? "" : "s"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_340px] gap-6 pb-20">
          {/* Left column */}
          <div className="space-y-5 min-w-0">
            {hasAboutContent ? (
              <>
                {company.description && (
                  <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> About {company.name}</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.description}</p>
                  </section>
                )}

                {company.missionVision && (
                  <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" /> Mission &amp; Vision</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.missionVision}</p>
                  </section>
                )}

                {company.whyJoinUs && (
                  <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Why Join Us</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.whyJoinUs}</p>
                  </section>
                )}

                {company.workCulture && (
                  <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-emerald-500" /> Work Culture</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{company.workCulture}</p>
                  </section>
                )}
              </>
            ) : (
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> About {company.name}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  This company hasn&apos;t added a description yet. Check out their open roles to learn more about what they&apos;re building.
                </p>
              </section>
            )}

            {company.benefits.length > 0 && (
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Benefits &amp; Perks</h2>
                <div className="flex flex-wrap gap-2">
                  {company.benefits.map((b) => (
                    <span key={b.id} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      {b.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {company.galleryUrls.length > 0 && (
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-violet-500" /> Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {company.galleryUrls.map((url) => (
                    <div key={url} className="aspect-square rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(company.headquarters || company.branchOffices.length > 0) && (
              <section className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" /> Locations</h2>
                <div className="space-y-2 text-sm text-zinc-600">
                  {company.headquarters && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">HQ</span>
                      {company.headquarters}
                    </div>
                  )}
                  {company.branchOffices.map((office) => (
                    <div key={office} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Branch</span>
                      {office}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column — open roles */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" /> Open Roles
              </h2>
              {company.jobs.length === 0 ? (
                <div className="py-6 text-center">
                  <Briefcase className="h-8 w-8 mx-auto text-zinc-200 mb-2" />
                  <p className="text-sm text-zinc-400">No open roles right now.</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Check back soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {company.jobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`} className="block rounded-xl border border-zinc-100 p-3.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm transition-all">
                      <div className="font-semibold text-sm text-zinc-900">{job.title}</div>
                      <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2 flex-wrap">
                        {job.category?.name && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">{job.category.name}</span>
                        )}
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      </div>
                      {job.publishedAt && <div className="text-[11px] text-zinc-400 mt-1.5">Posted {timeAgo(job.publishedAt)}</div>}
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
