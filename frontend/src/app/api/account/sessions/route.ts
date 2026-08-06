import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getSessionToken, hashToken } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getSessionToken();
  const currentHash = token ? hashToken(token) : null;

  const sessions = await prisma.session.findMany({
    where: { userId: me.id },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true, userAgent: true, ipAddress: true, createdAt: true,
      lastActiveAt: true, expiresAt: true, tokenHash: true,
    },
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.tokenHash === currentHash,
    })),
  });
}
