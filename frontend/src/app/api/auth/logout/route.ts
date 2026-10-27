import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getSessionToken, hashToken } from "@/lib/auth";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
