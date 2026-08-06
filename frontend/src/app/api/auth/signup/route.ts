import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setSessionCookie, hashToken } from "@/lib/auth";

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
  expYears: z.string().optional(),
  // Employer fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  gstNumber: z.string().optional(),
  registrationAs: z.string().optional(),
  designation: z.string().optional(),
  country: z.string().optional(),
});

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}

export async function POST(req: NextRequest) {
  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid input", details: data.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: data.data.email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await hashPassword(data.data.password);

  const yearsExp = data.data.expYears && data.data.expYears !== "Fresher"
    ? parseInt(data.data.expYears) || null
    : data.data.expYears === "Fresher" ? 0 : null;

  const user = await prisma.user.create({
    data: {
      email: data.data.email,
      name: data.data.name,
      phone: data.data.phone || null,
      location: data.data.location || null,
      role: data.data.role,
      passwordHash,
      gender: data.data.gender || null,
      dateOfBirth: data.data.dateOfBirth ? new Date(`${data.data.dateOfBirth}-01-01`) : null,
      yearsExperience: yearsExp,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  // For employers: create Company record
  if (data.data.role === "EMPLOYER" && data.data.companyName) {
    await prisma.company.create({
      data: {
        ownerId: user.id,
        name: data.data.companyName,
        slug: slugify(data.data.companyName),
        industry: data.data.industry || null,
        gstNumber: data.data.gstNumber || null,
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
