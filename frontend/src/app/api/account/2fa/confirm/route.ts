import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";

const Body = z.object({
  code: z.string().min(6).max(6),
});

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user?.twoFactorPendingSecret) {
    return NextResponse.json({ error: "No 2FA setup in progress. Start setup again." }, { status: 400 });
  }

  const valid = verifyTotp(user.twoFactorPendingSecret, parsed.data.code);
  if (!valid) return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingSecret: null,
    },
  });

  return NextResponse.json({ ok: true });
}
