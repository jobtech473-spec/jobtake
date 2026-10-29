export type PlanId = "LAUNCH_FREE" | "SINGLE" | "HIRING_PACK" | "GROWTH_PACK";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: number; // rupees, 0 for free
  jobs: number;
  perJob: number | null;
  save: number | null;
  badge: string | null;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "LAUNCH_FREE",
    name: "Launch Offer",
    tagline: "Get started with your first job post — absolutely free!",
    price: 0,
    jobs: 1,
    perJob: 0,
    save: null,
    badge: "LIMITED TIME OFFER",
    features: ["1 job posting", "30-day listing", "Standard listing and applications dashboard"],
  },
  {
    id: "SINGLE",
    name: "Single Post",
    tagline: "Perfect for small businesses and occasional hiring.",
    price: 200,
    jobs: 1,
    perJob: null,
    save: null,
    badge: null,
    features: ["1 job posting", "30-day listing", "Applications managed through Jobtake"],
  },
  {
    id: "HIRING_PACK",
    name: "Hiring Pack",
    tagline: "Best value for multiple vacancies and growing teams.",
    price: 899,
    jobs: 5,
    perJob: 180,
    save: 101,
    badge: "POPULAR",
    features: ["5 job postings", "Each job live for 30 days", "Use for multiple vacancies"],
  },
  {
    id: "GROWTH_PACK",
    name: "Growth Pack",
    tagline: "For employers who hire regularly and need more reach.",
    price: 1599,
    jobs: 10,
    perJob: 160,
    save: 401,
    badge: null,
    features: ["10 job postings", "Each job live for 30 days", "For employers hiring regularly"],
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id);
}
