import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateTotpSecret, otpauthUri } from "@/lib/totp";

// Starts 2FA setup: generates a new secret and stashes it as "pending" until the user
// confirms it with a valid code via /api/account/2fa/confirm. Not enabled yet.
export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: me.id },
    data: { twoFactorPendingSecret: secret },
  });

  return NextResponse.json({
    secret,
    otpauthUri: otpauthUri(secret, me.email),
  });
}
