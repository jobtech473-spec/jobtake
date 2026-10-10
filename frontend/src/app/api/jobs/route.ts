import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function parseSalaryLpa(value: string) {
  const lpa = Number(value);
  return Number.isFinite(lpa) && lpa >= 0 ? Math.round(lpa * 100000) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const workMode = searchParams.get("workMode") || "";
  const seniority = searchParams.get("seniority") || "";
  const collarType = searchParams.get("collarType") || "";
  const isMsme = searchParams.get("isMsme") === "true";
  const industry = searchParams.get("industry") || "";
  const salaryMin = parseSalaryLpa(searchParams.get("salaryMin") || "");
  const salaryMax = parseSalaryLpa(searchParams.get("salaryMax") || "");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(50, parseInt(searchParams.get("perPage") || "20", 10));

  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  const andFilters: Prisma.JobWhereInput[] = [];
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (workMode) where.workMode = workMode as Prisma.JobWhereInput["workMode"];
  if (seniority) where.seniority = seniority as Prisma.JobWhereInput["seniority"];
  if (industry) where.company = { industry: { equals: industry } };
  if (collarType === "MSME") {
    andFilters.push({
      OR: [
        { collarType: { equals: "MSME" } },
        { isMsme: true },
      ],
    });
  } else if (collarType) {
    (where as any).collarType = { equals: collarType };
  }
  if (isMsme && collarType !== "MSME") (where as any).isMsme = true;
  if (salaryMin !== null) andFilters.push({ salaryMax: { gte: salaryMin }, hideSalary: false });
  if (salaryMax !== null) andFilters.push({ salaryMin: { lte: salaryMax }, hideSalary: false });
  if (andFilters.length) where.AND = andFilters;

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: perPage,
      skip: (page - 1) * perPage,
      include: {
        company: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true } },
        jobSkills: { include: { skill: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, perPage, pages: Math.ceil(total / perPage) });
}
