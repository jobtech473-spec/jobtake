import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setSessionCookie, hashToken } from "@/lib/auth";

const Body = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
  expectedRole: z.enum(["EMPLOYER", "SEEKER", "ADMIN"]).optional(),
});

export async function POST(req: NextRequest) {
  const data = Body.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: data.data.email } });
  if (!user || user.status === "SUSPENDED") return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await verifyPassword(data.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // Role guard — if caller specifies expectedRole, enforce it (admins can sign in from any login form)
  if (data.data.expectedRole && user.role !== data.data.expectedRole && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

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

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
