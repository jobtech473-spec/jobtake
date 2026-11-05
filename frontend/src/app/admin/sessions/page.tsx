import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatUserId } from "@/lib/user-id";
import { SessionsTable } from "./SessionsTable";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const sessions = await prisma.session.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
    include: {
      user: { select: { id: true, serial: true, name: true, email: true, role: true, avatarUrl: true } },
    },
  });

  const rows = sessions.map(s => ({
    sessionId: s.id,
    userId: s.user.id,
    userSerial: s.user.serial,
    userName: s.user.name,
    userEmail: s.user.email,
    userRole: s.user.role,
    userAvatarUrl: s.user.avatarUrl,
    userLabel: formatUserId(s.user.serial),
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    geoLocation: s.geoLocation,
    createdAt: s.createdAt.toISOString(),
    lastActiveAt: s.lastActiveAt.toISOString(),
  }));

  return (
    <DashboardShell role="ADMIN" current="/admin/sessions">
      <SessionsTable sessions={rows} />
    </DashboardShell>
  );
}
