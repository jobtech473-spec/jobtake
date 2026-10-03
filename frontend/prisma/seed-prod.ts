// Production seed: master data + one admin account. No demo companies, jobs,
// users or testimonials. Safe to re-run (everything is upsert / ON CONFLICT).
//
//   ADMIN_EMAIL=you@example.com npx tsx prisma/seed-prod.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

// Data-only INSERTs that live inside migrations. Databases built with
// `prisma db push` skip them, so replay them here.
const DATA_MIGRATIONS = [
  "20260722120000_add_admin_job_options",
  "20260723113000_add_india_city_locations",
];

const CATEGORIES = [
  { name: "Engineering", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/b15e8c5cfb7d1ec31de40e3d0a48fa3d57328a860559d465c5b6a9d48e2cfc7f.png", accent: "from-violet-500/30 to-blue-500/30" },
  { name: "Design", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7ced41b8da5dfd1e7b68c30d1b062f51276683cbb765e407cfb3fc4feeb827b7.png", accent: "from-fuchsia-500/30 to-rose-500/30" },
  { name: "Marketing", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7f9d5878e0c79986e815cf77b5a769e36a38828c241f5328b6c8f6381b59cdd6.png", accent: "from-orange-400/30 to-amber-400/30" },
  { name: "Data Science", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/def7c8b428e49c00c648662d8af173be135d12b3fa8c9eed1359217518940ae8.png", accent: "from-cyan-400/30 to-blue-500/30" },
  { name: "Product", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/b15e8c5cfb7d1ec31de40e3d0a48fa3d57328a860559d465c5b6a9d48e2cfc7f.png", accent: "from-violet-500/30 to-indigo-500/30" },
  { name: "Sales", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/0e2c91ca9df49a6ad011009ca6789dd076976a5b258cd84d85bb1a44ab080172.png", accent: "from-emerald-500/30 to-teal-500/30" },
  { name: "Finance", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/0e2c91ca9df49a6ad011009ca6789dd076976a5b258cd84d85bb1a44ab080172.png", accent: "from-yellow-400/30 to-orange-500/30" },
  { name: "Operations", iconUrl: "https://static.prod-images.emergentagent.com/jobs/5a9f8343-d665-4fb3-a93d-8589bfd6fcdc/images/7f9d5878e0c79986e815cf77b5a769e36a38828c241f5328b6c8f6381b59cdd6.png", accent: "from-rose-400/30 to-pink-500/30" },
];

const OPTION_GROUPS: Record<string, string[]> = {
  EDUCATION: ["10th Pass", "12th Pass", "ITI Pass", "Diploma", "Under Graduate (UG)", "Post Graduate (PG)"],
  KEYWORD: ["Urgent Hiring", "Work From Home", "Immediate Joiner", "Walk-in Interview"],
  PG_SPECIALIZATION: ["Any postgraduate", "MBA / PGDM", "M.Tech", "MS / M.Sc", "MCA", "M.COM", "M.B.B.S.", "PG Diploma", "M.A.", "CA", "CS", "ICWA (CMA)", "Integrated PG", "LLM", "M.Ed", "MDS", "DM (Doctor of Medicine) Fellowship", "Master of Human Resource Development"],
  UG_SPECIALIZATION: ["Any graduate", "B.Tech/B.E.", "B.Com", "B.Sc", "Bachelors of Arts", "B.C.A.", "M.B.B.S.", "B.B.A. / B.M.S.", "Bachelors of Dental Surgary", "B.Pharma", "LLB - Bachelors of Laws", "B.Ed", "B.Arch"],
  DIPLOMA_SPECIALIZATION: ["Any Specialization", "Diploma in Mechanical Engineering", "Diploma in Electrical Engineering", "Diploma in Electronics Engineering", "Diploma in Civil Engineering", "Diploma in Computer Engineering", "Diploma in Automobile Engineering", "Diploma in Chemical Engineering", "Diploma in Information Technology", "Diploma in Pharmacy (D.Pharma)", "Diploma in Hotel Management", "Diploma in Fashion Designing", "Diploma in Interior Designing", "Diploma in Education (D.Ed)", "Post Graduate Diploma"],
  ITI_SPECIALIZATION: ["Any Specialization", "Attendant Operator (Chemical Plant)", "Civil and Mechanical Draughtsman", "Computer Operator and Programming Assistant", "Cosmetology", "Electrician", "Fashion Design and Technology", "Fitter", "Horticulture", "Information Communication Technology System Maintenance", "Machinist", "Mechanic", "Plumber", "Technician", "Welder"],
};

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  for (const name of DATA_MIGRATIONS) {
    const sql = readFileSync(path.join(__dirname, "migrations", name, "migration.sql"), "utf8");
    let insert = sql.slice(sql.indexOf("INSERT INTO")).trim().replace(/;\s*$/, "");
    if (!/ON CONFLICT/i.test(insert)) insert += ` ON CONFLICT ("type", "value") DO NOTHING`;
    const n = await prisma.$executeRawUnsafe(insert);
    console.log(`${name}: ${n} rows`);
  }

  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: slug(c.name) },
      update: {},
      create: { name: c.name, slug: slug(c.name), iconUrl: c.iconUrl, accent: c.accent, sortOrder: i, active: true },
    });
  }
  console.log(`categories: ${CATEGORIES.length}`);

  for (const [type, labels] of Object.entries(OPTION_GROUPS)) {
    for (let i = 0; i < labels.length; i++) {
      await prisma.jobOption.upsert({
        where: { type_value: { type: type as never, value: labels[i] } },
        update: {},
        create: { type: type as never, label: labels[i], value: labels[i], sortOrder: i, active: true },
      });
    }
  }
  console.log("job options: done");

  const email = (process.env.ADMIN_EMAIL || "admin@jobtake.com").toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`admin ${email} already exists — password unchanged`);
  } else {
    const password = randomBytes(9).toString("base64url");
    await prisma.user.create({
      data: { email, name: "Jobtake Admin", role: Role.ADMIN, status: "ACTIVE", passwordHash: await bcrypt.hash(password, 11) },
    });
    console.log(`ADMIN LOGIN  ${email}  /  ${password}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
