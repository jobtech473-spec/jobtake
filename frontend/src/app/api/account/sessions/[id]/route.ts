import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Best-effort revoke: this app uses stateless JWT session cookies, so deleting the DB
// record removes it from the "active sessions" list, but the underlying JWT (if the
// device still holds the cookie) remains valid until it expires or the user logs out.
// Full server-side token revocation would require moving to server-verified sessions.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session || session.userId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
