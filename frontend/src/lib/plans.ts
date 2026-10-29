// Starter plans seeded into the SubscriptionPlan table the first time it's
// empty. After that, plans are fully admin-managed (src/app/admin/plans) —
// this file is not read by the live pricing/checkout flow.
export const SEED_PLANS = [
  {
    name: "Launch Offer",
    tagline: "Get started with your first job post — absolutely free!",
    price: 0,
    jobs: 1,
    perJob: 0,
    save: null,
    badge: "LIMITED TIME OFFER",
    features: ["1 job posting", "30-day listing", "Standard listing and applications dashboard"],
    sortOrder: 0,
  },
  {
    name: "Single Post",
    tagline: "Perfect for small businesses and occasional hiring.",
    price: 200,
    jobs: 1,
    perJob: null,
    save: null,
    badge: null,
    features: ["1 job posting", "30-day listing", "Applications managed through Jobtake"],
    sortOrder: 1,
  },
  {
    name: "Hiring Pack",
    tagline: "Best value for multiple vacancies and growing teams.",
    price: 899,
    jobs: 5,
    perJob: 180,
    save: 101,
    badge: "POPULAR",
    features: ["5 job postings", "Each job live for 30 days", "Use for multiple vacancies"],
    sortOrder: 2,
  },
  {
    name: "Growth Pack",
    tagline: "For employers who hire regularly and need more reach.",
    price: 1599,
    jobs: 10,
    perJob: 160,
    save: 401,
    badge: null,
    features: ["10 job postings", "Each job live for 30 days", "For employers hiring regularly"],
    sortOrder: 3,
  },
];
