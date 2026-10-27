import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Lets support unstick a seeker/employer who's locked out of logging in on a
// new device because a stale Session row never got cleaned up (e.g. they
// closed the browser instead of signing out).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const { count } = await prisma.session.deleteMany({ where: { userId: id } });
  return NextResponse.json({ ok: true, count });
}
