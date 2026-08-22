import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const PatchBody = z.object({
  title:           z.string().min(3).optional(),
  description:     z.string().optional(),
  responsibilities:z.string().optional(),
  requirements:    z.string().optional(),
  benefits:        z.string().optional(),
  location:        z.string().min(1).optional(),
  workMode:        z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
  employmentType:  z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]).optional(),
  seniority:       z.enum(["INTERN", "ENTRY", "MID", "SENIOR", "STAFF", "PRINCIPAL", "DIRECTOR", "EXECUTIVE"]).optional(),
  experienceMin:   z.number().int().min(0).max(60).nullable().optional(),
  experienceMax:   z.number().int().min(0).max(60).nullable().optional(),
  salaryMin:       z.number().int().optional(),
  salaryMax:       z.number().int().optional(),
  salaryCurrency:  z.string().optional(),
  salaryPeriod:    z.enum(["month", "year"]).optional(),
  collarType:      z.enum(["WHITE", "BLUE", "PINK", "GREY", "MSME"]).optional(),
  hideSalary:      z.boolean().optional(),
  categoryName:    z.string().optional(),
  skills:          z.array(z.string()).optional(),
  status:          z.enum(["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"]).optional(),
  minEducation:    z.array(z.string()).optional(),
  educationSpecialization: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "ADMIN" && job.postedById !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = PatchBody.safeParse(await req.json().catch(() => ({})));
  if (body.success && body.data.status === "PUBLISHED" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an admin can publish a job. It will go live once approved." }, { status: 403 });
  }
  if (!body.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  if (
    body.data.experienceMin !== undefined &&
    body.data.experienceMax !== undefined &&
    body.data.experienceMin !== null &&
    body.data.experienceMax !== null &&
    body.data.experienceMin > body.data.experienceMax
  ) {
    return NextResponse.json({ error: "experienceMin cannot be greater than experienceMax" }, { status: 400 });
  }

  const { skills, categoryName, status, ...rest } = body.data;

  // Resolve category
  let categoryId: string | undefined;
  if (categoryName?.trim()) {
    const cat = await prisma.category.upsert({
      where: { name: categoryName.trim() },
      update: {},
      create: { name: categoryName.trim(), slug: slugify(categoryName.trim()) },
    });
    categoryId = cat.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...rest };
  if (categoryId) updateData.categoryId = categoryId;
  if (status) {
    updateData.status = status;
    if (status === "PUBLISHED") updateData.publishedAt = new Date();
  }

  const updated = await prisma.job.update({ where: { id }, data: updateData });

  // Update skills if provided
  if (skills !== undefined) {
    await prisma.jobSkill.deleteMany({ where: { jobId: id } });
    for (const skillName of skills) {
      const sn = skillName.trim();
      if (!sn) continue;
      const skill = await prisma.skill.upsert({
        where: { name: sn }, update: {}, create: { name: sn, slug: slugify(sn) },
      });
      await prisma.jobSkill.create({ data: { jobId: id, skillId: skill.id } }).catch(() => null);
    }
  }

  return NextResponse.json({ job: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "ADMIN" && job.postedById !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
