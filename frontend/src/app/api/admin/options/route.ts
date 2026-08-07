import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { groupManagedOptions } from "@/lib/job-options";

const OptionType = z.enum(["LOCATION", "INDUSTRY", "ROLE", "CTC", "EXPERIENCE", "KEYWORD", "EDUCATION"]);

const Schema = z.object({
  type: OptionType,
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const options = await prisma.jobOption.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { label: "asc" }] });
  return NextResponse.json({ options: groupManagedOptions(options, false) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = Schema.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid option data" }, { status: 400 });

  const option = await prisma.jobOption.create({ data: data.data });
  return NextResponse.json({ option });
}
