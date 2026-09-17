"use client";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export type CollarJob = {
  id: string;
  slug: string;
  title: string;
  location: string;
  salaryLabel: string;
  postedAgo: string;
  company: { name: string; initial: string };
};

export type CollarSection = {
  type: "WHITE" | "BLUE" | "PINK" | "GREY" | "MSME";
  activeJobs: number;
  companies: number;
  jobs: CollarJob[];
};

const COLLAR_META = {
  WHITE: {
    label: "White-Collar Jobs",
    desc: "Office-based professional roles in corporate environments.",
    tags: "Corporate · Professional · Desk Jobs",
    emoji: "🏢",
    growth: "18%",
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    iconBg: "bg-blue-600",
    text: "text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  BLUE: {
    label: "Blue-Collar Jobs",
    desc: "Skilled and manual labor roles that build and power our world.",
    tags: "Skilled · Technical · Hands-on",
    emoji: "🔧",
    growth: "14%",
    bg: "bg-gradient-to-r from-teal-50 to-cyan-50",
    iconBg: "bg-teal-600",
    text: "text-teal-700",
    btn: "bg-teal-600 hover:bg-teal-700",
  },
  PINK: {
    label: "Diversity Jobs",
    desc: "Service and care-oriented roles that make a real difference.",
    tags: "Care · Service · Support",
    emoji: "🌸",
    growth: "16%",
    bg: "bg-gradient-to-r from-pink-50 to-rose-50",
    iconBg: "bg-pink-500",
    text: "text-pink-700",
    btn: "bg-pink-500 hover:bg-pink-600",
  },
  GREY: {
    label: "Grey-Collar Jobs",
    desc: "Technical and supervisory roles bridging skilled trades and management.",
    tags: "Technical · Supervisory · Hybrid",
    emoji: "⚙️",
    growth: "12%",
    bg: "bg-gradient-to-r from-zinc-100 to-slate-100",
    iconBg: "bg-zinc-600",
    text: "text-zinc-700",
    btn: "bg-zinc-600 hover:bg-zinc-700",
  },
  MSME: {
    label: "MSME Jobs",
    desc: "Roles at micro, small & medium enterprises driving local economies.",
    tags: "Local · Enterprise · Growth",
    emoji: "🏭",
    growth: "20%",
    bg: "bg-gradient-to-r from-orange-50 to-amber-50",
    iconBg: "bg-orange-500",
    text: "text-orange-700",
    btn: "bg-orange-500 hover:bg-orange-600",
  },
};

export function CollarSections({ sections }: { sections: CollarSection[] }) {
  const order: Array<"WHITE" | "BLUE" | "PINK" | "GREY" | "MSME"> = ["WHITE", "BLUE", "PINK", "GREY", "MSME"];

  return (
    <section className="relative py-24 md:py-32" data-testid="collar-sections">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 rounded-3xl bg-gradient-to-r from-blue-50/60 to-transparent p-6 md:p-8">
          <div>
            <div className="text-xs tracking-[0.22em] uppercase text-blue-600 font-bold">Explore opportunities</div>
            <h2 className="font-display mt-3 text-4xl md:text-5xl tracking-tight font-medium text-zinc-950 leading-[1.05] max-w-xl">
              Jobs for Every <span className="text-black">Career Path</span>
            </h2>
            <p className="text-zinc-700 max-w-lg text-base mt-3">Find the right opportunities across different job categories. Choose the path that suits your skills and aspirations.</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-100 grid place-items-center"><ShieldCheck className="h-4 w-4 text-blue-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Trusted Employers</div>
                <div className="text-xs text-zinc-700">Verified companies hiring across India</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 grid place-items-center"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Quality Opportunities</div>
                <div className="text-xs text-zinc-700">Relevant jobs, real growth.</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-purple-100 grid place-items-center"><Zap className="h-4 w-4 text-purple-600" /></div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Updated Daily</div>
                <div className="text-xs text-zinc-700">Fresh openings every day</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {order.map((type, i) => {
            const meta = COLLAR_META[type];
            const section = sections.find(s => s.type === type);
            const activeJobs = section?.activeJobs ?? 0;
            const companies = section?.companies ?? 0;

            return (
              <motion.div key={type}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.7 }}
              >
                <Link
                  href={type === "MSME" ? "/jobs?isMsme=true" : `/jobs?collarType=${type}`}
                  className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-5 rounded-3xl ${meta.bg} border border-white/60 p-5 md:p-6 group hover:shadow-md transition-shadow`}
                >
                  <div className={`h-14 w-14 shrink-0 rounded-2xl ${meta.iconBg} grid place-items-center text-2xl shadow`}>
                    {meta.emoji}
                  </div>

                  <div className="flex-1 min-w-[220px]">
                    <h3 className="text-lg md:text-xl font-bold text-zinc-900">{meta.label}</h3>
                    <p className="text-sm text-zinc-700 mt-1 max-w-md">{meta.desc}</p>
                    <p className={`text-xs font-medium mt-1.5 ${meta.text}`}>{meta.tags}</p>
                  </div>

                  <div className="flex items-center gap-6 lg:gap-8 shrink-0">
                    <div>
                      <div className={`flex items-center gap-1.5 font-bold text-lg ${meta.text}`}>
                        <Briefcase className="h-4 w-4" /> {activeJobs.toLocaleString()}+
                      </div>
                      <div className="text-[11px] text-zinc-700 mt-0.5">Active Jobs</div>
                    </div>
                  </div>

                  <div className={`hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-white ${meta.btn} px-5 py-2.5 rounded-full transition shrink-0`}>
                    View jobs <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
