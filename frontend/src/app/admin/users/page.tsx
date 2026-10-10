import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true, status: true,
      avatarUrl: true, emailVerified: true, createdAt: true, updatedAt: true, lastLoginAt: true,
      _count: { select: { applications: true, savedJobs: true } },
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const inactiveUsers = users.filter(u => u.status !== "ACTIVE").length;
  const employers = users.filter(u => u.role === "EMPLOYER").length;
  const seekers = users.filter(u => u.role === "SEEKER").length;

  return (
    <DashboardShell role="ADMIN" current="/admin/users">
      <UsersTable
        users={users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatarUrl,
          emailVerified: !!u.emailVerified,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          applicationsCount: u._count.applications,
          savedJobsCount: u._count.savedJobs,
        }))}
        stats={{ totalUsers, activeUsers, inactiveUsers, employers, seekers }}
      />
    </DashboardShell>
  );
}
