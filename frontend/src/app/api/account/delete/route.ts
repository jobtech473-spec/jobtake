import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyPassword, clearSessionCookie } from "@/lib/auth";

const Body = z.object({
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Password is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });

  try {
    // Hard delete — relations to this user cascade per schema (applications, resumes,
    // sessions, notifications, etc). Company ownership / job postings use non-cascading
    // relations, so if this user owns a company or posted jobs the delete will fail with
    // a foreign key constraint; in that case fall back to a soft delete.
    await prisma.user.delete({ where: { id: user.id } });
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "SUSPENDED" },
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true, redirect: "/" });
}
