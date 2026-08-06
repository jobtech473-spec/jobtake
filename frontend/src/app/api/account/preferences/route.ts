import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  emailNotifications: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: me.id },
    data: { ...parsed.data },
    select: { emailNotifications: true },
  });

  return NextResponse.json({ user });
}
