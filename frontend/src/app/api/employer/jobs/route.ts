import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const Body = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(""),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  location: z.string().min(1),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]).default("REMOTE"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]).default("FULL_TIME"),
  seniority: z.enum(["INTERN", "ENTRY", "MID", "SENIOR", "STAFF", "PRINCIPAL", "DIRECTOR", "EXECUTIVE"]).default("MID"),
  experienceMin: z.number().int().min(0).max(60).optional(),
  experienceMax: z.number().int().min(0).max(60).optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  salaryCurrency: z.string().default("INR"),
  salaryPeriod: z.enum(["month", "year"]).default("month"),
  industry: z.string().optional(),
  collarType: z.enum(["WHITE", "BLUE", "PINK", "GREY", "MSME"]).default("WHITE"),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  skills: z.array(z.string()).default([]),
  companyId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "EMPLOYER" && user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) {
    const fields = data.error.flatten().fieldErrors;
    const first = Object.entries(fields).find(([, v]) => v?.length);
    const msg = first ? `${first[0]}: ${first[1]?.[0]}` : "Invalid form data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (
    data.data.experienceMin !== undefined &&
    data.data.experienceMax !== undefined &&
    data.data.experienceMin > data.data.experienceMax
  ) {
    return NextResponse.json({ error: "experienceMin cannot be greater than experienceMax" }, { status: 400 });
  }

  // pick company: provided, or first owned, or auto-create
  let companyId = data.data.companyId;
  if (!companyId) {
    const owned = await prisma.company.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });
    if (owned) companyId = owned.id;
    else {
      const c = await prisma.company.create({
        data: { ownerId: user.id, name: `${user.name}'s Company`, slug: slugify(`${user.name}-${Date.now()}`), status: "ACTIVE" },
      });
      companyId = c.id;
    }
  }

  // Resolve categoryId — use provided or find/create by name
  let categoryId = data.data.categoryId;
  if (!categoryId && data.data.categoryName?.trim()) {
    const catName = data.data.categoryName.trim();
    const cat = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName, slug: slugify(catName) },
    });
    categoryId = cat.id;
  }

  const base = slugify(data.data.title);
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

  const job = await prisma.job.create({
    data: {
      companyId,
      postedById: user.id,
      categoryId,
      title: data.data.title,
      slug,
      description: data.data.description,
      responsibilities: data.data.responsibilities,
      requirements: data.data.requirements,
      benefits: data.data.benefits,
      location: data.data.location,
      workMode: data.data.workMode,
      employmentType: data.data.employmentType,
      seniority: data.data.seniority,
      experienceMin: data.data.experienceMin,
      experienceMax: data.data.experienceMax,
      salaryMin: data.data.salaryMin,
      salaryMax: data.data.salaryMax,
      salaryCurrency: data.data.salaryCurrency,
      salaryPeriod: data.data.salaryPeriod,
      collarType: data.data.collarType,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  // skills
  for (const skillName of data.data.skills) {
    const sn = skillName.trim();
    if (!sn) continue;
    const skill = await prisma.skill.upsert({
      where: { name: sn },
      update: {},
      create: { name: sn, slug: slugify(sn) },
    });
    await prisma.jobSkill.create({ data: { jobId: job.id, skillId: skill.id } }).catch(() => null);
  }

  return NextResponse.json({ job });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const where = user.role === "ADMIN" ? {} : { postedById: user.id };
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true, logoUrl: true } }, _count: { select: { applications: true } } },
  });
  return NextResponse.json({ jobs });
}
