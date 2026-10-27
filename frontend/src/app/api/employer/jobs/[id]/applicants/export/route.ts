import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      title: true, postedById: true,
      applications: {
        orderBy: { createdAt: "desc" },
        select: {
          stage: true, createdAt: true,
          user: {
            select: {
              name: true, email: true, phone: true, location: true,
              yearsExperience: true, currentCompany: true, currentDesignation: true,
              currentSalary: true, expectedSalary: true, noticePeriod: true,
              educations: { orderBy: { startYear: "desc" }, take: 1, select: { degree: true, field: true, school: true } },
              experiences: { orderBy: [{ current: "desc" }, { startDate: "desc" }], take: 1, select: { title: true, company: true } },
              userSkills: { select: { skill: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (me.role !== "ADMIN" && job.postedById !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applicants");
  sheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Location", key: "location", width: 20 },
    { header: "Stage", key: "stage", width: 14 },
    { header: "Experience (yrs)", key: "experience", width: 16 },
    { header: "Current Company", key: "company", width: 22 },
    { header: "Current Designation", key: "designation", width: 22 },
    { header: "Current Salary (Lacs)", key: "currentSalary", width: 18 },
    { header: "Expected Salary (Lacs)", key: "expectedSalary", width: 20 },
    { header: "Notice Period", key: "noticePeriod", width: 16 },
    { header: "Education", key: "education", width: 30 },
    { header: "Skills", key: "skills", width: 36 },
    { header: "Applied On", key: "appliedOn", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const app of job.applications) {
    const edu = app.user.educations[0];
    const exp = app.user.experiences[0];
    sheet.addRow({
      name: app.user.name,
      email: app.user.email,
      phone: app.user.phone ?? "",
      location: app.user.location ?? "",
      stage: STAGE_LABEL[app.stage] ?? app.stage,
      experience: app.user.yearsExperience ?? "",
      company: app.user.currentCompany ?? exp?.company ?? "",
      designation: app.user.currentDesignation ?? exp?.title ?? "",
      currentSalary: app.user.currentSalary ?? "",
      expectedSalary: app.user.expectedSalary ?? "",
      noticePeriod: app.user.noticePeriod ?? "",
      education: edu ? `${edu.degree}${edu.field ? ` (${edu.field})` : ""} — ${edu.school}` : "",
      skills: app.user.userSkills.map(us => us.skill.name).join(", "),
      appliedOn: app.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const safeTitle = job.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "job";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeTitle}-applicants.xlsx"`,
    },
  });
}
