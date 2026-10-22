import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setSessionCookie, hashToken } from "@/lib/auth";
import { slugify as toSlug } from "@/lib/utils";
import { mimeFromName } from "@/lib/uploads";
import { sendResumeCopy } from "@/lib/mailer";
import { isValidIndianMobile } from "@/lib/utils";

const MAX_RESUME_BYTES = 2 * 1024 * 1024;

const Body = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  role: z.enum(["SEEKER", "EMPLOYER"]).default("SEEKER"),
  // Candidate fields
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  registrationType: z.enum(["EXPERIENCED", "FRESHER"]).optional(),
  yearsExperience: z.string().optional(),
  currentSalary: z.string().optional(),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
  education: z.string().optional(),
  educationSpecialization: z.string().optional(),
  schoolName: z.string().optional(),
  passingYear: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  bio: z.string().optional(),
  resumeDataUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  // Employer fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  gstNumber: z.string().optional(),
  gstCertificateUrl: z.string().optional(),
  registrationAs: z.string().optional(),
  designation: z.string().optional(),
  country: z.string().optional(),
});

// Indian GSTIN: 2-digit state code, 10-char PAN, entity code, "Z", checksum.
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}

function parseDateOfBirth(value?: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00.000Z`);
  if (/^\d{4}$/.test(value)) return new Date(`${value}-01-01T00:00:00.000Z`);
  return null;
}

function parseIntOrNull(value?: string) {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid input", details: data.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: data.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });

  if (!isValidIndianMobile(data.data.phone)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9." }, { status: 400 });
  }

  // One employer account per GST number.
  const gstNumber = (data.data.gstNumber ?? "").replace(/\s+/g, "").toUpperCase();
  if (data.data.role === "EMPLOYER") {
    if (!GSTIN.test(gstNumber)) return NextResponse.json({ error: "Please enter a valid 15-character GST number." }, { status: 400 });
    if (!data.data.gstCertificateUrl) return NextResponse.json({ error: "Please upload your GST certificate." }, { status: 400 });
    const gstTaken = await prisma.company.findFirst({ where: { gstNumber: { equals: gstNumber, mode: "insensitive" } }, select: { id: true } });
    if (gstTaken) return NextResponse.json({ error: "An employer account with this GST number already exists. Please sign in instead." }, { status: 409 });
  }

  const isExperienced = data.data.registrationType !== "FRESHER";

  let resumeBuffer: Buffer | null = null;
  if (data.data.role === "SEEKER") {
    if (!data.data.resumeDataUrl || !data.data.resumeFileName) {
      return NextResponse.json({ error: "Please upload your resume." }, { status: 400 });
    }
    const commaIdx = data.data.resumeDataUrl.indexOf(",");
    const base64 = commaIdx >= 0 ? data.data.resumeDataUrl.slice(commaIdx + 1) : data.data.resumeDataUrl;
    resumeBuffer = Buffer.from(base64, "base64");
    if (resumeBuffer.length > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: `Resume is too large (max ${Math.round(MAX_RESUME_BYTES / (1024 * 1024))}MB).` }, { status: 400 });
    }
    if (!data.data.bio?.trim()) {
      return NextResponse.json({ error: "Please fill in About Me." }, { status: 400 });
    }
    const minSkills = isExperienced ? 5 : 1;
    if (data.data.skills.filter(s => s.trim()).length < minSkills) {
      return NextResponse.json({ error: `Please add at least ${minSkills} key skill${minSkills > 1 ? "s" : ""}.` }, { status: 400 });
    }
    if (isExperienced) {
      const missing =
        !data.data.yearsExperience ? "Years of Experience" :
        !data.data.noticePeriod ? "Notice Period" :
        !data.data.currentSalary ? "Current CTC" :
        !data.data.expectedSalary ? "Expected CTC" :
        !data.data.currentCompany ? "Current Company" :
        !data.data.currentDesignation ? "Current Designation" : null;
      if (missing) return NextResponse.json({ error: `Please fill in ${missing}.` }, { status: 400 });
    }
    if (!data.data.location) return NextResponse.json({ error: "Please select your location." }, { status: 400 });
    if (!data.data.education || !data.data.schoolName || !data.data.passingYear) {
      return NextResponse.json({ error: "Please fill in your education details." }, { status: 400 });
    }
  }

  const passwordHash = await hashPassword(data.data.password);

  const user = await prisma.user.create({
    data: {
      email: data.data.email,
      name: data.data.name,
      phone: data.data.phone || null,
      location: data.data.location || null,
      role: data.data.role,
      passwordHash,
      gender: data.data.gender || null,
      dateOfBirth: parseDateOfBirth(data.data.dateOfBirth),
      bio: data.data.bio || null,
      yearsExperience: parseIntOrNull(data.data.yearsExperience),
      noticePeriod: isExperienced ? (data.data.noticePeriod || null) : null,
      currentSalary: isExperienced ? parseIntOrNull(data.data.currentSalary) : null,
      expectedSalary: isExperienced ? parseIntOrNull(data.data.expectedSalary) : null,
      currentCompany: isExperienced ? (data.data.currentCompany || null) : null,
      currentDesignation: isExperienced ? (data.data.currentDesignation || null) : null,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  // Candidate education, skills and resume
  if (data.data.role === "SEEKER") {
    const startYear = parseIntOrNull(data.data.passingYear);
    if (data.data.education && data.data.schoolName && startYear) {
      await prisma.education.create({
        data: {
          userId: user.id,
          school: data.data.schoolName,
          degree: data.data.education,
          field: data.data.educationSpecialization?.trim() || null,
          startYear,
        },
      }).catch(() => null);
    }

    for (const skillName of data.data.skills.slice(0, 20)) {
      const sn = skillName.trim();
      if (!sn) continue;
      const skill = await prisma.skill.upsert({
        where: { name: sn },
        update: {},
        create: { name: sn, slug: toSlug(sn) },
      });
      await prisma.userSkill.create({ data: { userId: user.id, skillId: skill.id } }).catch(() => null);
    }

    if (resumeBuffer && data.data.resumeDataUrl && data.data.resumeFileName) {
      await prisma.resume.create({
        data: {
          userId: user.id,
          fileName: data.data.resumeFileName,
          fileUrl: data.data.resumeDataUrl,
          fileSize: resumeBuffer.length,
          isPrimary: true,
        },
      }).catch(() => null);
      await sendResumeCopy({
        to: "resume@jobtake.com",
        applicantName: user.name,
        applicantEmail: user.email,
        fileName: data.data.resumeFileName,
        buffer: resumeBuffer,
        mime: mimeFromName(data.data.resumeFileName),
      }).catch(() => null);
    }
  }

  // For employers: create Company record
  if (data.data.role === "EMPLOYER" && data.data.companyName) {
    await prisma.company.create({
      data: {
        ownerId: user.id,
        name: data.data.companyName,
        slug: slugify(data.data.companyName),
        industry: data.data.industry || null,
        gstNumber: gstNumber || null,
        gstCertificateUrl: data.data.gstCertificateUrl || null,
        registrationAs: data.data.registrationAs || "COMPANY",
        contactDesignation: data.data.designation || null,
        headquarters: data.data.country || "India",
        status: "PENDING",
      },
    }).catch(() => null); // non-blocking if company creation fails
  }

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  }).catch(() => {});

  await prisma.auditLog.create({ data: { userId: user.id, action: "auth.signup", entity: "User", entityId: user.id } }).catch(() => null);

  return NextResponse.json({ user });
}
