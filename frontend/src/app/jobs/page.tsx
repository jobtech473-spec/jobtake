import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { JobsListClient } from "./JobsListClient";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; location?: string; category?: string; workMode?: string; seniority?: string; collarType?: string; page?: string; sort?: string }>;

export default async function JobsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = sp.q || "";
  const location = sp.location || "";
  const categorySlug = sp.category || "";
  const workMode = sp.workMode || "";
  const seniority = sp.seniority || "";
  const collarType = sp.collarType || "";
  const sort = sp.sort || "newest";
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const perPage = 12;

  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
    { company: { name: { contains: q, mode: "insensitive" } } },
  ];
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (categorySlug) where.category = { slug: categorySlug };
  if (workMode) where.workMode = workMode as Prisma.JobWhereInput["workMode"];
  if (seniority) where.seniority = seniority as Prisma.JobWhereInput["seniority"];
  if (collarType) (where as any).collarType = { equals: collarType };

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    sort === "salary"
      ? [{ salaryMax: "desc" }, { salaryMin: "desc" }]
      : sort === "relevant"
      ? [{ featured: "desc" }, { viewsCount: "desc" }, { publishedAt: "desc" }]
      : [{ featured: "desc" }, { publishedAt: "desc" }];

  const me = await getCurrentUser();

  const [jobs, total, categories, savedJobs] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      take: perPage,
      skip: (page - 1) * perPage,
      include: {
        company: { select: { name: true, logoUrl: true, slug: true } },
        category: { select: { name: true, slug: true } },
        jobSkills: { include: { skill: true } },
      },
    }),
    prisma.job.count({ where }),
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    me ? prisma.savedJob.findMany({ where: { userId: me.id }, select: { jobId: true } }) : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen">
      <PublicNav />
      <div className="pt-32 pb-20 mx-auto max-w-7xl px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight" data-testid="jobs-heading">
          Find your next <span className="text-blue-600">opportunity</span>
        </h1>
        <p className="text-zinc-700 mt-3 text-base">Explore top roles across industries and locations.</p>

        <JobsListClient
          initialFilters={{ q, location, category: categorySlug, workMode, seniority, collarType }}
          initialSort={sort}
          jobs={jobs.map(j => ({
            id: j.id,
            slug: j.slug,
            title: j.title,
            location: j.location,
            workMode: j.workMode,
            seniority: j.seniority,
            experienceMin: j.experienceMin,
            experienceMax: j.experienceMax,
            salaryMin: j.salaryMin,
            salaryMax: j.salaryMax,
            salaryCurrency: j.salaryCurrency,
            salaryPeriod: j.salaryPeriod,
            hideSalary: j.hideSalary,
            collarType: (j as any).collarType || null,
            featured: j.featured,
            publishedAt: j.publishedAt?.toISOString() || null,
            company: j.company,
            category: j.category,
            skills: j.jobSkills.map(js => js.skill.name).slice(0, 4),
          }))}
          total={total}
          page={page}
          perPage={perPage}
          categories={categories}
          isLoggedIn={!!me}
          initialSavedIds={savedJobs.map(s => s.jobId)}
        />
      </div>
      <PublicFooter />
    </main>
  );
}
