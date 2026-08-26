import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getManagedOptions } from "@/lib/job-options";
import { redirect, notFound } from "next/navigation";
import { EditJobClient } from "./EditJobClient";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me || (me.role !== "EMPLOYER" && me.role !== "ADMIN")) redirect("/employers/login");

  const job = await prisma.job.findUnique({
    where: { id },
    include: { category: true, jobSkills: { include: { skill: true } } },
  });

  if (!job) notFound();
  if (me.role !== "ADMIN" && job.postedById !== me.id) redirect("/employer/jobs");


  const [categories, options] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getManagedOptions(true, true),
  ]);

  return (
    <DashboardShell role={me.role} current="/employer/jobs">
      <EditJobClient
        job={{
          id: job.id,
          title: job.title,
          description: job.description ?? "",
          responsibilities: job.responsibilities ?? "",
          requirements: job.requirements ?? "",
          benefits: job.benefits ?? "",
          location: job.location ?? "",
          workMode: job.workMode ?? "ONSITE",
          employmentType: job.employmentType ?? "FULL_TIME",
          seniority: job.seniority ?? "MID",
          experienceMin: job.experienceMin ?? null,
          experienceMax: job.experienceMax ?? null,
          collarType: job.collarType ?? "WHITE",
          salaryMin: job.salaryMin ?? null,
          salaryMax: job.salaryMax ?? null,
          skills: job.jobSkills.map(s => s.skill.name),
          categoryName: job.category?.name ?? "",
          minEducation: job.minEducation,
          educationSpecialization: job.educationSpecialization ?? "",
        }}
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
        options={options}
      />
    </DashboardShell>
  );
}
