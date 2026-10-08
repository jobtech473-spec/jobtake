import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const Schema = z.object({
  name: z.string(),
  logoUrl: z.string(),
  websiteUrl: z.string().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const items = await prisma.partnerLogo.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ logos: items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = Schema.safeParse(await req.json().catch(() => ({})));
  if (!data.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const logo = await prisma.partnerLogo.create({ data: data.data });
  return NextResponse.json({ logo });
}
