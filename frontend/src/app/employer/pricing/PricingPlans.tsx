"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Gift, FileText, Users, Rocket, Check, Loader2, X, ShieldCheck } from "lucide-react";

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string | null;
  price: number;
  jobs: number;
  perJob: number | null;
  save: number | null;
  badge: string | null;
  features: string[];
};

const PLAN_ICONS = [Gift, FileText, Users, Rocket];

export function PricingPlans({
  plans, claimedFreePlanIds, isEmployer, onObtained,
}: {
  plans: PricingPlan[];
  claimedFreePlanIds: string[];
  isEmployer: boolean;
  onObtained?: () => void;
}) {
  const router = useRouter();
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const claimed = new Set(claimedFreePlanIds);

  async function claimFreePlan(plan: PricingPlan) {
    setClaiming(plan.id);
    setError(null);
    const res = await fetch("/api/employer/billing/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id }),
    });
    const data = await res.json().catch(() => ({}));
    setClaiming(null);
    if (!res.ok) { setError(data.error || "Failed to claim plan"); return; }
    onObtained?.();
    router.refresh();
  }

  return (
    <>
      {error && <div className="max-w-2xl mx-auto mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center">{error}</div>}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {plans.map((plan, i) => {
          const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
          const isFree = plan.price === 0;
          const alreadyClaimed = isFree && claimed.has(plan.id);
          return (
            <div key={plan.id} className={`relative rounded-2xl border p-6 flex flex-col ${plan.badge === "LIMITED TIME OFFER" ? "border-blue-200 bg-blue-50/40" : "border-zinc-200 bg-white"}`}>
              {plan.badge && (
                <span className={`absolute -top-3 left-5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1 ${plan.badge === "POPULAR" ? "bg-blue-600 text-white" : "bg-red-500 text-white"}`}>
                  {plan.badge === "LIMITED TIME OFFER" && <Clock className="h-3 w-3" />} {plan.badge}
                </span>
              )}
              <div className="h-11 w-11 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-zinc-700" />
              </div>
              <h3 className="font-black text-zinc-900 text-lg">{plan.name}</h3>
              {plan.tagline && <p className="text-sm text-zinc-500 mt-1 flex-1">{plan.tagline}</p>}

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  {isFree ? (
                    <span className="text-3xl font-black text-blue-600">FREE</span>
                  ) : (
                    <>
                      <span className="text-sm text-zinc-500">₹</span>
                      <span className="text-3xl font-black text-zinc-900">{plan.price}</span>
                      <span className="text-sm text-zinc-500">/ {plan.jobs > 1 ? `${plan.jobs} jobs` : "job"}</span>
                    </>
                  )}
                </div>
                {plan.perJob != null && plan.save != null && (
                  <div className="text-xs text-zinc-500 mt-1">₹{plan.perJob} per job &nbsp;|&nbsp; <span className="text-emerald-600 font-semibold">Save ₹{plan.save}</span></div>
                )}
              </div>

              {plan.features.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              )}

              {isEmployer && (
                isFree ? (
                  <button
                    disabled={claiming === plan.id || alreadyClaimed}
                    onClick={() => claimFreePlan(plan)}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {claiming === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {alreadyClaimed ? "Already Claimed" : "Post a Job Free"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutPlan(plan)}
                    className={`mt-5 w-full font-semibold text-sm py-2.5 rounded-xl transition ${plan.badge === "POPULAR" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border border-blue-200 text-blue-700 hover:bg-blue-50"}`}
                  >
                    Choose Plan →
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {checkoutPlan && (
        <DummyCheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} onSuccess={() => { setCheckoutPlan(null); onObtained?.(); router.refresh(); }} />
      )}
    </>
  );
}

function DummyCheckoutModal({ plan, onClose, onSuccess }: { plan: PricingPlan; onClose: () => void; onSuccess: () => void }) {
  const [stage, setStage] = useState<"review" | "processing" | "error">("review");
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setStage("processing");
    const res = await fetch("/api/employer/billing/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Payment failed"); setStage("error"); return; }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0f1c3f] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center text-[#0f1c3f] font-black text-xs">R</div>
            <div>
              <div className="font-bold text-sm">Razorpay</div>
              <div className="text-[10px] text-zinc-300">Test Mode</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5">
          <div className="text-sm text-zinc-500">Jobtake</div>
          <div className="font-bold text-zinc-900">{plan.name}</div>
          <div className="text-2xl font-black text-zinc-900 mt-1">₹{plan.price}.00</div>
          <div className="text-xs text-zinc-400 mt-1">{plan.jobs} job posting credit{plan.jobs > 1 ? "s" : ""}</div>

          {stage === "review" && (
            <>
              <div className="mt-5 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-600 bg-zinc-50">
                This is a test-mode payment. No real money will be charged.
              </div>
              <button onClick={pay} className="mt-4 w-full bg-[#0f1c3f] hover:bg-[#182a52] text-white font-semibold text-sm py-3 rounded-xl transition">
                Pay ₹{plan.price} (Test)
              </button>
            </>
          )}

          {stage === "processing" && (
            <div className="mt-6 flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#0f1c3f]" />
              <span className="text-sm text-zinc-500">Processing payment…</span>
            </div>
          )}

          {stage === "error" && (
            <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 mt-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay (test mode)
          </div>
        </div>
      </div>
    </div>
  );
}
