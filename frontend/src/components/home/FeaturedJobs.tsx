"use client";
import { motion } from "framer-motion";
import { MapPin, Laptop2, ArrowRight, Bookmark, BadgeCheck, IndianRupee, GraduationCap, Star, ShieldCheck, Sparkles, Zap, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type FeaturedJob = {
  id: string;
  slug: string;
  title: string;
  location: string;
  workMode: string;
  experienceLabel: string;
  salaryLabel: string;
  postedAgo: string;
  tags: string[];
  isMsme: boolean;
  company: { name: string; logoUrl: string | null; initial: string; category: string; employees: string };
  logoColor: string;
};

function JobCard({ job, i }: { job: FeaturedJob; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: i * 0.05, duration: 0.6 }}
    >
      <Link
        href={`/jobs/${job.slug}`}
        className="rounded-2xl border border-zinc-200 bg-white p-5 block hover:shadow-md hover:border-zinc-300 transition-all"
        data-testid={`featured-job-${job.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${job.logoColor} grid place-items-center text-white font-bold text-sm shrink-0`}>
              {job.company.initial}
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                {job.company.name} <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="text-xs text-zinc-700 mt-0.5">{job.company.category} · {job.company.employees}</div>
            </div>
          </div>
          <Bookmark className="h-4 w-4 text-zinc-400 shrink-0" />
        </div>

        <h3 className="font-display font-semibold text-zinc-950 text-base mt-4 leading-tight">{job.title}</h3>
        {job.isMsme && (
          <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-600 border border-orange-200">
            MSME
          </span>
        )}

        <div className="mt-2.5 flex items-center gap-4 text-xs text-zinc-700">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
          <span className="inline-flex items-center gap-1"><Laptop2 className="h-3.5 w-3.5" /> {job.workMode}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700">{t}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-5 text-xs font-medium text-zinc-700">
          <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {job.salaryLabel} PA</span>
          <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {job.experienceLabel}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">View details <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedJobs({ jobs }: { jobs: FeaturedJob[] }) {
  const [activeTab, setActiveTab] = useState("All Opportunities");
  const tabs = ["All Opportunities", ...Array.from(new Set(jobs.map(j => j.company.category)))];
  const visibleJobs = activeTab === "All Opportunities" ? jobs : jobs.filter(j => j.company.category === activeTab);

  return (
    <section className="relative py-24 md:py-32" data-testid="featured-jobs-section">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 rounded-3xl bg-gradient-to-r from-blue-50/60 to-transparent p-6 md:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase text-blue-600 font-bold">
              <Star className="h-3.5 w-3.5 fill-blue-600" /> Featured opportunities
            </div>
            <h2 className="font-display mt-3 text-4xl md:text-5xl tracking-tight font-medium text-zinc-950 leading-[1.05] max-w-2xl">
              Top Opportunities for Your Next Career Move
            </h2>
            <p className="text-zinc-700 max-w-lg text-base mt-3">Handpicked roles from trusted employers across India. Explore opportunities that match your skills and ambitions.</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-100 grid place-items-center"><ShieldCheck className="h-4 w-4 text-blue-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Trusted Employers</div>
                <div className="text-xs text-zinc-700">Verified companies hiring actively</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 grid place-items-center"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Quality Opportunities</div>
                <div className="text-xs text-zinc-700">Relevant roles, real growth.</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-purple-100 grid place-items-center"><Zap className="h-4 w-4 text-purple-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Updated Daily</div>
                <div className="text-xs text-zinc-700">Stay ahead with fresh openings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  activeTab === tab ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {tab === "All Opportunities" && <LayoutGrid className="h-3.5 w-3.5" />}
                {tab}
              </button>
            ))}
          </div>
          <Link href="/jobs" className="btn-glass rounded-full px-5 py-3 text-sm font-medium inline-flex items-center gap-2 w-fit shrink-0" data-testid="view-all-jobs">
            View all roles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {visibleJobs.length === 0 ? (
          <div className="text-center text-zinc-700 py-12">No roles in this category yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {visibleJobs.map((j, i) => <JobCard key={j.id} job={j} i={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}
