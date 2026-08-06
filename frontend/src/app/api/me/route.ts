import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { syncUserSkills } from "@/lib/skills";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

const PatchBody = z.object({
  name:     z.string().min(1).optional(),
  headline: z.string().optional(),
  bio:      z.string().max(500).optional(),
  phone:    z.string().optional(),
  location: z.string().optional(),
  skills:   z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = PatchBody.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { skills, ...rest } = body.data;

  const user = await prisma.user.update({
    where: { id: me.id },
    data: { ...rest },
  });

  if (skills) await syncUserSkills(me.id, skills);

  return NextResponse.json({ user });
}
