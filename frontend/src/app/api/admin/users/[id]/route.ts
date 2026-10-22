import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  role: z.enum(["ADMIN", "EMPLOYER", "SEEKER"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const data = Schema.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const u = await prisma.user.update({ where: { id }, data: data.data });
  return NextResponse.json({ user: { id: u.id, role: u.role, status: u.status } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  if (id === me.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ error: "Admin accounts cannot be deleted here." }, { status: 400 });

  // Job.postedById and Company.ownerId don't cascade, so jobs/companies this
  // user owns have to go first or the user delete fails on the FK.
  await prisma.$transaction([
    prisma.job.deleteMany({ where: { postedById: id } }),
    prisma.company.deleteMany({ where: { ownerId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
