"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { PricingPlans, PricingPlan } from "../pricing/PricingPlans";

export function PlansGateModal({
  plans, claimedFreePlanIds, dismissible,
}: {
  plans: PricingPlan[];
  claimedFreePlanIds: string[];
  dismissible: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl my-8 p-6 sm:p-8 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-zinc-900">Choose a Job Posting Plan</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {dismissible
              ? "Pick a plan to get more job posting credits, or close this to continue with your current credits."
              : "You're out of job posting credits. Choose a plan below to continue, or close this for now."}
          </p>
        </div>
        {plans.length === 0 ? (
          <p className="text-center text-zinc-400 text-sm">No plans are available right now. Please check back soon.</p>
        ) : (
          <PricingPlans
            plans={plans}
            claimedFreePlanIds={claimedFreePlanIds}
            isEmployer={true}
            onObtained={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
