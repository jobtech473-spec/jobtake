import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { z } from "zod";

const Body = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const experiences = await prisma.experience.findMany({
    where: { userId: me.id },
    orderBy: [{ current: "desc" }, { startDate: "desc" }],
  });
  return jsonOk({ experiences });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError("Invalid data", 400);
  const { title, company, location, startDate, endDate, current, description } = parsed.data;

  const experience = await prisma.experience.create({
    data: {
      userId: me.id,
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || null,
      startDate: new Date(startDate),
      endDate: current ? null : (endDate ? new Date(endDate) : null),
      current: !!current,
      description: description?.trim() || null,
    },
  });

  return jsonOk({ experience }, 201);
}
