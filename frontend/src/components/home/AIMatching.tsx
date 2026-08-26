"use client";
import { motion } from "framer-motion";
import { Sparkles, Timer, Target, ShieldCheck, BrainCircuit, Users, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

const COMPANY_LOGOS = [
  { name: "Stripe", text: "stripe" },
  { name: "Notion", text: "Notion" },
  { name: "Razorpay", text: "Razorpay" },
  { name: "CRED", text: "CRED" },
  { name: "Zepto", text: "zepto" },
  { name: "Meesho", text: "meesho" },
];

export function AIMatching() {
  return (
    <div className="bg-white" data-testid="ai-matching-section">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Native Matching
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-[1.05] tracking-tight whitespace-nowrap">
                Find the Right Match.<br />
                <span className="text-blue-600">Faster.</span>
              </h1>

              <p className="mt-6 text-zinc-700 text-lg leading-relaxed max-w-md">
                Jobtake&apos;s calibrated AI evaluates trajectory, skills, and context — not just keywords. So every match feels right, not random.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { icon: Timer,      bg: "bg-blue-50",   iconColor: "text-blue-600",   title: "Shortlists in under 4 minutes",       desc: "Signal-graded candidates, instantly." },
                  { icon: Target,     bg: "bg-emerald-50",iconColor: "text-emerald-600", title: "Skills, taste & trajectory weighted",  desc: "We evaluate what truly predicts performance." },
                  { icon: ShieldCheck,bg: "bg-violet-50", iconColor: "text-violet-600",  title: "Private & secure",                    desc: "Your data stays private and never indexed." },
                ].map(({ icon: Icon, bg, iconColor, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 text-sm">{title}</div>
                      <div className="text-zinc-700 text-sm mt-0.5">{desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-4 flex-wrap">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20">
                  <Sparkles className="h-4 w-4" /> Get matched
                </Link>
                <Link href="/jobs" className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 font-bold px-6 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors text-sm">
                  Browse jobs →
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted by startups and enterprises across industries
              </div>
            </motion.div>

            {/* Right — AI illustration card with animations */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 relative overflow-hidden">

                {/* Top cards row */}
                <div className="flex justify-between mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 w-[46%]"
                  >
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Senior PM</div>
                      <div className="text-xs font-bold text-blue-600">96% match</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 w-[46%]"
                  >
                    <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Trajectory</div>
                      <div className="text-xs font-bold text-orange-500">Director-ready</div>
                    </div>
                  </motion.div>
                </div>

                {/* Center — AI circle + side cards */}
                <div className="relative flex items-center justify-center h-52 my-2">
                  {/* Spinning dashed rings - 3 */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute h-52 w-52 rounded-full border border-dashed border-blue-200"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute h-44 w-44 rounded-full border-2 border-dashed border-zinc-300"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute h-24 w-24 rounded-full border border-dashed border-violet-200"
                  />

                  {/* AI Circle — pulse */}
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 z-10 relative"
                  >
                    <BrainCircuit className="h-10 w-10 text-white" strokeWidth={1.5} />
                  </motion.div>

                  {/* Left — Taste card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Taste</div>
                        <div className="text-xs font-bold text-orange-500">A+</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right — Culture fit card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Culture fit</div>
                        <div className="text-xs font-bold text-emerald-600">High</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Matches refined card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 mx-auto w-fit mt-4"
                >
                  <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">3,418 matches refined</div>
                    <div className="text-xs text-zinc-700">in 11.4 seconds</div>
                  </div>
                </motion.div>

                {/* Bottom stats bar */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.85, duration: 0.6 }}
                  className="mt-5 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden"
                >
                  {[
                    { icon: Users,      color: "text-blue-600",   bg: "bg-blue-50",   label: "Smart matches",  sub: "Quality over quantity" },
                    { icon: Zap,        color: "text-orange-500", bg: "bg-orange-50", label: "Fast & efficient",sub: "Save hours every week" },
                    { icon: ShieldCheck,color: "text-blue-600",   bg: "bg-blue-50",   label: "Bias-reduced",   sub: "Fairer evaluations" },
                    { icon: BarChart3,  color: "text-blue-600",   bg: "bg-blue-50",   label: "Better hires",   sub: "Built for real impact" },
                  ].map(({ icon: Icon, color, bg, label, sub }) => (
                    <div key={label} className="flex flex-col items-center py-3 px-2 text-center bg-white">
                      <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center mb-1.5`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="text-[11px] font-bold text-zinc-900 leading-tight">{label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{sub}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    
      
    </div>
  );
}
