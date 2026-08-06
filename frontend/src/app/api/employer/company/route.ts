import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, slugify } from "@/lib/utils";
import { NextRequest } from "next/server";

function buildData(body: any) {
  const {
    name, tagline, description, website, industry, size, founded, headquarters,
    branchOffices, logoUrl, bannerUrl, missionVision, whyJoinUs, workCulture,
    teamSize, galleryUrls, linkedinUrl, facebookUrl, instagramUrl, twitterUrl,
  } = body;

  return {
    name: name.trim(),
    tagline: tagline?.trim() || null,
    description: description?.trim() || null,
    website: website?.trim() || null,
    industry: industry?.trim() || null,
    size: size?.trim() || null,
    founded: founded ? parseInt(founded) : null,
    headquarters: headquarters?.trim() || null,
    branchOffices: Array.isArray(branchOffices) ? branchOffices.filter(Boolean) : [],
    logoUrl: logoUrl?.trim() || null,
    bannerUrl: bannerUrl?.trim() || null,
    missionVision: missionVision?.trim() || null,
    whyJoinUs: whyJoinUs?.trim() || null,
    workCulture: workCulture?.trim() || null,
    teamSize: teamSize?.trim() || null,
    galleryUrls: Array.isArray(galleryUrls) ? galleryUrls.filter(Boolean) : [],
    linkedinUrl: linkedinUrl?.trim() || null,
    facebookUrl: facebookUrl?.trim() || null,
    instagramUrl: instagramUrl?.trim() || null,
    twitterUrl: twitterUrl?.trim() || null,
  };
}

async function syncBenefits(companyId: string, benefits: unknown) {
  if (!Array.isArray(benefits)) return;
  const labels = benefits.map(b => String(b).trim()).filter(Boolean);
  await prisma.companyBenefit.deleteMany({ where: { companyId } });
  if (labels.length) {
    await prisma.companyBenefit.createMany({ data: labels.map(label => ({ companyId, label })) });
  }
}

export async function PUT(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") return jsonError("Unauthorized", 401);

  const body = await req.json();
  if (!body.name?.trim()) return jsonError("Company name is required");

  const company = await prisma.company.findFirst({ where: { ownerId: me.id }, orderBy: { createdAt: "asc" } });
  if (!company) return jsonError("Company not found", 404);

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: buildData(body),
  });

  await syncBenefits(company.id, body.benefits);

  return jsonOk({ company: updated });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "EMPLOYER") return jsonError("Unauthorized", 401);

  const body = await req.json();
  if (!body.name?.trim()) return jsonError("Company name is required");

  const existing = await prisma.company.findFirst({ where: { ownerId: me.id } });
  if (existing) return jsonError("Company already exists. Use PUT to update.", 400);

  const slug = slugify(body.name) + "-" + Date.now().toString(36);

  const company = await prisma.company.create({
    data: { ownerId: me.id, slug, ...buildData(body) },
  });

  await syncBenefits(company.id, body.benefits);

  return jsonOk({ company }, 201);
}
