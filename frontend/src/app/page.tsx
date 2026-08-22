import { prisma } from "@/lib/prisma";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import Hero from "@/components/home/Hero";
import { LogoWall } from "@/components/home/LogoWall";
import { FeaturedJobs, type FeaturedJob } from "@/components/home/FeaturedJobs";
import { CollarSections, type CollarSection } from "@/components/home/CollarSections";
import { formatSalary, timeAgo } from "@/lib/utils";

const LOGO_PALETTE = [
  "from-violet-500 to-fuchsia-500",
  "from-brand-orange to-amber-600",
  "from-indigo-500 to-brand-blue",
  "from-zinc-800 to-zinc-950",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
];

export default async function Home() {
  const [featuredRaw, totalJobs, collarJobsRaw] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      take: 9,
      include: { company: { select: { name: true, logoUrl: true } }, category: { select: { name: true } }, jobSkills: { include: { skill: true } } },
    }),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
  ]);

  const COLLAR_TYPES = ["WHITE", "BLUE", "PINK", "GREY", "MSME"] as const;
  const collarSections: CollarSection[] = COLLAR_TYPES.map(type => {
    const typeJobs = (collarJobsRaw as any[]).filter((j: any) => j.collarType === type);
    return {
      type,
      activeJobs: typeJobs.length,
      companies: new Set(typeJobs.map((j: any) => j.company.name)).size,
      jobs: typeJobs.slice(0, 8).map(j => ({
        id: j.id,
        slug: j.slug,
        title: j.title,
        location: j.location,
        salaryLabel: j.hideSalary ? "Not disclosed" : formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod),
        postedAgo: j.publishedAt ? timeAgo(j.publishedAt) : "recent",
        company: { name: j.company.name, initial: j.company.name[0].toUpperCase() },
      })),
    };
  });

  const SENIORITY_LABEL: Record<string, string> = {
    INTERN: "0 yrs Exp", ENTRY: "0-2 yrs Exp", MID: "2-5 yrs Exp", SENIOR: "5-8 yrs Exp",
    STAFF: "8-10 yrs Exp", PRINCIPAL: "10+ yrs Exp", DIRECTOR: "12+ yrs Exp", EXECUTIVE: "15+ yrs Exp",
  };
  const EMPLOYEE_BANDS = ["50+ Employees", "200+ Employees", "500+ Employees", "1000+ Employees"];

  const featured: FeaturedJob[] = featuredRaw.map((j, i) => ({
    id: j.id,
    slug: j.slug,
    title: j.title,
    location: j.location,
    workMode: j.workMode.charAt(0) + j.workMode.slice(1).toLowerCase(),
    experienceLabel: SENIORITY_LABEL[j.seniority] ?? "Exp not specified",
    salaryLabel: j.hideSalary ? "Not disclosed" : formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod),
    postedAgo: j.publishedAt ? timeAgo(j.publishedAt) : "recent",
    tags: j.jobSkills.map((js) => js.skill.name).slice(0, 3),
    company: {
      name: j.company.name,
      logoUrl: j.company.logoUrl,
      initial: j.company.name[0].toUpperCase(),
      category: j.category?.name ?? "General",
      employees: EMPLOYEE_BANDS[(j.company.name.length + i) % EMPLOYEE_BANDS.length],
    },
    logoColor: LOGO_PALETTE[i % LOGO_PALETTE.length],
  }));

  return (
    <main data-testid="home-page">
      <PublicNav />
      <Hero />
      <LogoWall />
      <FeaturedJobs jobs={featured} />
      <CollarSections sections={collarSections} />

      <PublicFooter />
    </main>
  );
}
