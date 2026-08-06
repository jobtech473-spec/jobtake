import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/** Replace a user's full skill set with the given list of skill names. */
export async function syncUserSkills(userId: string, names: string[]) {
  const clean = Array.from(
    new Set(names.map(n => n.trim()).filter(Boolean))
  ).slice(0, 50);

  const skillIds: string[] = [];
  for (const name of clean) {
    const slug = slugify(name);
    const skill = await prisma.skill.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    skillIds.push(skill.id);
  }

  await prisma.userSkill.deleteMany({
    where: { userId, ...(skillIds.length ? { skillId: { notIn: skillIds } } : {}) },
  });

  for (const skillId of skillIds) {
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      update: {},
      create: { userId, skillId },
    });
  }

  return prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });
}

export async function getUserSkills(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });
}
