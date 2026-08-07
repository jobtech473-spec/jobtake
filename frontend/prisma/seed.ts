import { PrismaClient, Role, JobStatus, WorkMode, SeniorityLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORY_ICONS = [
  { name: "Engineering", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/b15e8c5cfb7d1ec31de40e3d0a48fa3d57328a860559d465c5b6a9d48e2cfc7f.png", accent: "from-violet-500/30 to-blue-500/30" },
  { name: "Design", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7ced41b8da5dfd1e7b68c30d1b062f51276683cbb765e407cfb3fc4feeb827b7.png", accent: "from-fuchsia-500/30 to-rose-500/30" },
  { name: "Marketing", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7f9d5878e0c79986e815cf77b5a769e36a38828c241f5328b6c8f6381b59cdd6.png", accent: "from-orange-400/30 to-amber-400/30" },
  { name: "Data Science", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/def7c8b428e49c00c648662d8af173be135d12b3fa8c9eed1359217518940ae8.png", accent: "from-cyan-400/30 to-blue-500/30" },
  { name: "Product", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/b15e8c5cfb7d1ec31de40e3d0a48fa3d57328a860559d465c5b6a9d48e2cfc7f.png", accent: "from-violet-500/30 to-indigo-500/30" },
  { name: "Sales", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/0e2c91ca9df49a6ad011009ca6789dd076976a5b258cd84d85bb1a44ab080172.png", accent: "from-emerald-500/30 to-teal-500/30" },
  { name: "Finance", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/0e2c91ca9df49a6ad011009ca6789dd076976a5b258cd84d85bb1a44ab080172.png", accent: "from-yellow-400/30 to-orange-500/30" },
  { name: "Operations", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7f9d5878e0c79986e815cf77b5a769e36a38828c241f5328b6c8f6381b59cdd6.png", accent: "from-rose-400/30 to-pink-500/30" },
];

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding…");
  // Users
  const adminHash = await bcrypt.hash("admin12345", 11);
  const employerHash = await bcrypt.hash("employer123", 11);
  const seekerHash = await bcrypt.hash("seeker12345", 11);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jobtake.com" },
    update: {},
    create: { email: "admin@jobtake.com", name: "Jobtake Admin", role: Role.ADMIN, passwordHash: adminHash, status: "ACTIVE" },
  });
  const employer = await prisma.user.upsert({
    where: { email: "employer@jobtake.com" },
    update: {},
    create: { email: "employer@jobtake.com", name: "Hire Manager", role: Role.EMPLOYER, passwordHash: employerHash, status: "ACTIVE" },
  });
  // Dedicated owner for demo/showcase companies used to populate public job listings.
  // Kept separate from `employer` so the interactive test-employer account owns exactly
  // one company, matching the app's one-company-per-employer assumption.
  const demoOwner = await prisma.user.upsert({
    where: { email: "demo-companies@jobtake.internal" },
    update: {},
    create: { email: "demo-companies@jobtake.internal", name: "Jobtake Demo Companies", role: Role.EMPLOYER, passwordHash: employerHash, status: "SUSPENDED" },
  });
  const seeker = await prisma.user.upsert({
    where: { email: "seeker@jobtake.com" },
    update: {},
    create: { email: "seeker@jobtake.com", name: "Ada Lovelace", role: Role.SEEKER, passwordHash: seekerHash, status: "ACTIVE", headline: "Staff Frontend Engineer", location: "Remote · EU" },
  });

  // Categories
  for (let i = 0; i < CATEGORY_ICONS.length; i++) {
    const c = CATEGORY_ICONS[i];
    await prisma.category.upsert({
      where: { slug: slug(c.name) },
      update: { iconUrl: c.iconUrl, accent: c.accent, sortOrder: i, active: true },
      create: { name: c.name, slug: slug(c.name), iconUrl: c.iconUrl, accent: c.accent, sortOrder: i, active: true },
    });
  }

  // Companies
  const companies = [
    { name: "Linear", tagline: "Build the modern software workflow.", industry: "Software", size: "51-200", logoBg: "from-violet-500 to-fuchsia-500" },
    { name: "Anthropic", tagline: "Safety-first AI research lab.", industry: "AI", size: "201-500", logoBg: "from-orange-500 to-amber-600" },
    { name: "Stripe", tagline: "Payments for the internet economy.", industry: "Fintech", size: "1000+", logoBg: "from-indigo-500 to-blue-600" },
    { name: "Vercel", tagline: "Develop. Preview. Ship.", industry: "DevTools", size: "201-500", logoBg: "from-zinc-800 to-zinc-950" },
    { name: "Figma", tagline: "Where teams design together.", industry: "Design", size: "1000+", logoBg: "from-pink-500 to-rose-600" },
    { name: "Jane Street", tagline: "Quantitative trading firm.", industry: "Finance", size: "1000+", logoBg: "from-emerald-500 to-teal-600" },
  ];

  const companyMap: Record<string, string> = {};
  for (const c of companies) {
    const co = await prisma.company.upsert({
      where: { slug: slug(c.name) },
      update: { name: c.name, tagline: c.tagline, ownerId: demoOwner.id, industry: c.industry, size: c.size },
      create: {
        ownerId: demoOwner.id,
        name: c.name, slug: slug(c.name), tagline: c.tagline,
        industry: c.industry, size: c.size, status: "ACTIVE", verified: true, featured: true,
      },
    });
    companyMap[c.name] = co.id;
  }

  // The interactive test-employer account gets its own single company.
  await prisma.company.upsert({
    where: { slug: "hire-manager-co" },
    update: { ownerId: employer.id },
    create: {
      ownerId: employer.id,
      name: "Hire Manager Co", slug: "hire-manager-co", tagline: "Demo employer account company.",
      industry: "IT & Software", size: "51-200", status: "ACTIVE", verified: true, featured: false,
    },
  });

  // Skills
  const skillNames = ["TypeScript", "React", "Node.js", "Python", "Rust", "Go", "PyTorch", "Figma", "Design Systems", "Motion", "Distributed Systems", "LLMs", "SQL", "Lifecycle Marketing", "Brand", "OCaml", "Statistics", "Strategy", "Platform"];
  for (const s of skillNames) {
    await prisma.skill.upsert({ where: { name: s }, update: {}, create: { name: s, slug: slug(s) } });
  }
  const skillIds = Object.fromEntries((await prisma.skill.findMany()).map(s => [s.name, s.id]));

  // Sample jobs
  const sampleJobs = [
    { title: "Senior Product Designer", company: "Linear", category: "Design", location: "San Francisco · Hybrid", workMode: WorkMode.HYBRID, seniority: SeniorityLevel.SENIOR, salaryMin: 180000, salaryMax: 240000, skills: ["Figma", "Design Systems", "Motion"], featured: true, description: "Define and craft the next chapter of Linear's design language. You'll work alongside founding designers on systems, motion and brand surface area.", responsibilities: "Lead end-to-end design of major features. Mentor mid-level designers. Own the Linear motion vocabulary.", requirements: "8+ years of product design. Strong systems and motion thinking. Comfort with ambiguity at senior IC level.", benefits: "Equity. Quarterly retreats. Top-tier health coverage." },
    { title: "Staff Machine Learning Engineer", company: "Anthropic", category: "Engineering", location: "Remote · Worldwide", workMode: WorkMode.REMOTE, seniority: SeniorityLevel.STAFF, salaryMin: 320000, salaryMax: 480000, skills: ["PyTorch", "LLMs", "Distributed Systems", "Python"], featured: true, description: "Lead research engineering on frontier model training. Own kernels, data pipelines and distributed training at scale.", responsibilities: "Design, build and own model training infrastructure. Mentor research engineers.", requirements: "10+ years engineering, deep distributed systems experience.", benefits: "Equity. Unlimited PTO. Best-in-class compute." },
    { title: "Head of Growth Marketing", company: "Stripe", category: "Marketing", location: "New York · On-site", workMode: WorkMode.ONSITE, seniority: SeniorityLevel.DIRECTOR, salaryMin: 240000, salaryMax: 310000, skills: ["Lifecycle Marketing", "Brand", "Strategy"], featured: true, description: "Build the growth function for Stripe's enterprise products in NYC. Own pipeline strategy from MQL to closed-won.", responsibilities: "Build a 12-person growth team. Own pipeline strategy.", requirements: "Senior B2B SaaS growth experience.", benefits: "Equity. Top-tier benefits." },
    { title: "Principal Software Engineer", company: "Vercel", category: "Engineering", location: "Remote · US", workMode: WorkMode.REMOTE, seniority: SeniorityLevel.PRINCIPAL, salaryMin: 260000, salaryMax: 340000, skills: ["TypeScript", "Rust", "Node.js"], featured: true, description: "Drive the next generation of Vercel's edge runtime. Own architectural decisions across infrastructure.", responsibilities: "Architecture, mentorship, technical strategy.", requirements: "10+ years engineering, edge & runtime experience.", benefits: "Equity. Remote-first." },
    { title: "Director of Product", company: "Figma", category: "Product", location: "London · Hybrid", workMode: WorkMode.HYBRID, seniority: SeniorityLevel.DIRECTOR, salaryMin: 190000, salaryMax: 240000, skills: ["Strategy", "Platform"], featured: true, description: "Lead Figma's platform product org from London.", responsibilities: "Org leadership, vision, hiring.", requirements: "Director-level platform PM experience.", benefits: "Equity. Hybrid model." },
    { title: "Quant Researcher", company: "Jane Street", category: "Finance", location: "Hong Kong · On-site", workMode: WorkMode.ONSITE, seniority: SeniorityLevel.SENIOR, salaryMin: 400000, salaryMax: 650000, skills: ["OCaml", "Statistics"], featured: true, description: "Quantitative research on global derivatives markets from Hong Kong.", responsibilities: "Build and validate trading strategies.", requirements: "PhD or 5+ years quant research.", benefits: "Top-of-market compensation." },
    { title: "Senior Frontend Engineer", company: "Linear", category: "Engineering", location: "Remote", workMode: WorkMode.REMOTE, seniority: SeniorityLevel.SENIOR, salaryMin: 160000, salaryMax: 210000, skills: ["TypeScript", "React"], featured: false, description: "Own complex client-side features at Linear.", responsibilities: "Ship best-in-class frontend experiences.", requirements: "7+ years, deep TypeScript & React.", benefits: "Equity." },
    { title: "Brand Designer", company: "Figma", category: "Design", location: "Remote · EU", workMode: WorkMode.REMOTE, seniority: SeniorityLevel.MID, salaryMin: 110000, salaryMax: 150000, skills: ["Figma", "Brand"], featured: false, description: "Shape Figma's brand identity across global touchpoints.", responsibilities: "Brand campaigns, identity work.", requirements: "5+ years brand design.", benefits: "Remote-first." },
    { title: "Data Scientist", company: "Stripe", category: "Data Science", location: "Remote · US", workMode: WorkMode.REMOTE, seniority: SeniorityLevel.MID, salaryMin: 140000, salaryMax: 190000, skills: ["Python", "SQL", "Statistics"], featured: false, description: "Drive product insights with rigorous data science.", responsibilities: "Build dashboards and models.", requirements: "5+ years applied DS.", benefits: "Equity." },
  ];

  for (const j of sampleJobs) {
    const existing = await prisma.job.findFirst({ where: { title: j.title, companyId: companyMap[j.company] } });
    if (existing) continue;
    const cat = await prisma.category.findUnique({ where: { slug: slug(j.category) } });
    const created = await prisma.job.create({
      data: {
        companyId: companyMap[j.company],
        postedById: employer.id,
        categoryId: cat?.id,
        title: j.title, slug: `${slug(j.title)}-${Math.random().toString(36).slice(2, 7)}`,
        description: j.description, responsibilities: j.responsibilities, requirements: j.requirements, benefits: j.benefits,
        location: j.location, workMode: j.workMode, seniority: j.seniority,
        salaryMin: j.salaryMin, salaryMax: j.salaryMax, salaryCurrency: "USD",
        status: JobStatus.PUBLISHED, featured: j.featured, publishedAt: new Date(),
      },
    });
    for (const sk of j.skills) {
      const id = skillIds[sk];
      if (id) await prisma.jobSkill.create({ data: { jobId: created.id, skillId: id } }).catch(() => null);
    }
  }

  // Homepage stats
  const stats = [
    { label: "Active candidates", value: "2.4", suffix: "M", iconKey: "users", accent: "from-violet-500 to-blue-500", sortOrder: 0 },
    { label: "Roles filled this year", value: "184320", suffix: "+", iconKey: "jobs", accent: "from-blue-500 to-cyan-500", sortOrder: 1 },
    { label: "Verified hiring teams", value: "3200", suffix: "+", iconKey: "building", accent: "from-orange-500 to-amber-500", sortOrder: 2 },
    { label: "Avg time to offer", value: "14", suffix: " days", iconKey: "trophy", accent: "from-amber-500 to-yellow-500", sortOrder: 3 },
  ];
  for (const s of stats) {
    const existing = await prisma.homepageStat.findFirst({ where: { label: s.label } });
    if (!existing) await prisma.homepageStat.create({ data: { ...s, active: true } });
  }

  // Testimonials
  const ts = [
    { name: "Priya Raghavan", role: "Principal Engineer · Linear", quote: "Jobtake matched me with a role I didn't even know existed. Three weeks from sign-up to a Principal offer.", avatarUrl: "https://images.pexels.com/photos/12931653/pexels-photo-12931653.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", accent: "from-violet-400 to-blue-500" },
    { name: "Marcus Lin", role: "Head of Design · Northwind", quote: "The AI shortlist felt like having a senior recruiter who actually understood staff-level design work.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", accent: "from-orange-400 to-amber-500" },
    { name: "Elena Voss", role: "VP People · Lumen Robotics", quote: "We closed three staff hires in 22 days — every candidate already pre-vetted against our culture and bar.", avatarUrl: "https://images.pexels.com/photos/12931653/pexels-photo-12931653.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", accent: "from-emerald-400 to-teal-500" },
  ];
  for (let i = 0; i < ts.length; i++) {
    const existing = await prisma.testimonial.findFirst({ where: { name: ts[i].name } });
    if (!existing) await prisma.testimonial.create({ data: { ...ts[i], sortOrder: i, active: true } });
  }

  // Master data: Education levels & Keyword tags (so admins have real, editable rows from day one)
  const educationLevels = [
    ["10th Pass", "10th Pass"],
    ["12th Pass", "12th Pass"],
    ["ITI Pass", "ITI Pass"],
    ["Diploma", "Diploma"],
    ["Under Graduate (UG)", "Under Graduate (UG)"],
    ["Post Graduate (PG)", "Post Graduate (PG)"],
  ];
  for (let i = 0; i < educationLevels.length; i++) {
    const [label, value] = educationLevels[i];
    await prisma.jobOption.upsert({
      where: { type_value: { type: "EDUCATION", value } },
      update: {},
      create: { type: "EDUCATION", label, value, sortOrder: i, active: true },
    });
  }
  const keywordTags = [
    ["Urgent Hiring", "Urgent Hiring"],
    ["Work From Home", "Work From Home"],
    ["Immediate Joiner", "Immediate Joiner"],
    ["Walk-in Interview", "Walk-in Interview"],
  ];
  for (let i = 0; i < keywordTags.length; i++) {
    const [label, value] = keywordTags[i];
    await prisma.jobOption.upsert({
      where: { type_value: { type: "KEYWORD", value } },
      update: {},
      create: { type: "KEYWORD", label, value, sortOrder: i, active: true },
    });
  }

  console.log("Seed complete.");
  console.log("Login credentials:");
  console.log("  Admin    : admin@jobtake.com / admin12345");
  console.log("  Employer : employer@jobtake.com / employer123");
  console.log("  Seeker   : seeker@jobtake.com / seeker12345");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
