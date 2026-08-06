import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EditProfileClient } from "./EditProfileClient";

export default async function EditProfilePage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "SEEKER") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/login");

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: me.id },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });

  return (
    <DashboardShell role="SEEKER" current="/dashboard/profile">
      <EditProfileClient
        initialName={user.name ?? ""}
        initialHeadline={user.headline ?? ""}
        initialBio={user.bio ?? ""}
        initialPhone={user.phone ?? ""}
        initialLocation={user.location ?? ""}
        initialSkills={userSkills.map(us => us.skill.name)}
      />
    </DashboardShell>
  );
}
