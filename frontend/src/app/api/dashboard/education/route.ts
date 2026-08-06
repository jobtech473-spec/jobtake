import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { z } from "zod";

const Body = z.object({
  school: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int().optional().nullable(),
  description: z.string().optional(),
});

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const educations = await prisma.education.findMany({
    where: { userId: me.id },
    orderBy: [{ startYear: "desc" }],
  });
  return jsonOk({ educations });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError("Invalid data", 400);
  const { school, degree, field, startYear, endYear, description } = parsed.data;

  const education = await prisma.education.create({
    data: {
      userId: me.id,
      school: school.trim(),
      degree: degree.trim(),
      field: field?.trim() || null,
      startYear,
      endYear: endYear ?? null,
      description: description?.trim() || null,
    },
  });

  return jsonOk({ education }, 201);
}
