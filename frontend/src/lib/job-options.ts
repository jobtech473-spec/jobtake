import { prisma } from "@/lib/prisma";
import { emptyManagedOptions, ManagedOption, ManagedOptions, ManagedOptionType } from "@/lib/job-option-types";

const FALLBACKS: ManagedOptions = {
  LOCATION: [
    option("LOCATION", "Mumbai, India", "Mumbai, India", 0),
    option("LOCATION", "Bengaluru, India", "Bengaluru, India", 1),
    option("LOCATION", "Delhi NCR, India", "Delhi NCR, India", 2),
    option("LOCATION", "Pune, India", "Pune, India", 3),
    option("LOCATION", "Hyderabad, India", "Hyderabad, India", 4),
    option("LOCATION", "Remote", "Remote", 5),
  ],
  INDUSTRY: [
    option("INDUSTRY", "IT & Software", "IT & Software", 0),
    option("INDUSTRY", "Manufacturing", "Manufacturing", 1),
    option("INDUSTRY", "Healthcare", "Healthcare", 2),
    option("INDUSTRY", "Finance & Banking", "Finance & Banking", 3),
    option("INDUSTRY", "Retail & FMCG", "Retail & FMCG", 4),
    option("INDUSTRY", "Construction", "Construction", 5),
  ],
  ROLE: [
    option("ROLE", "Software Engineer", "Software Engineer", 0),
    option("ROLE", "Sales Executive", "Sales Executive", 1),
    option("ROLE", "HR Manager", "HR Manager", 2),
    option("ROLE", "Customer Support", "Customer Support", 3),
    option("ROLE", "Factory Operator", "Factory Operator", 4),
    option("ROLE", "Delivery Driver", "Delivery Driver", 5),
  ],
  CTC: [
    option("CTC", "0 - 3 LPA", "0-3", 0),
    option("CTC", "3 - 6 LPA", "3-6", 1),
    option("CTC", "6 - 10 LPA", "6-10", 2),
    option("CTC", "10 - 15 LPA", "10-15", 3),
    option("CTC", "15 - 25 LPA", "15-25", 4),
    option("CTC", "25+ LPA", "25-", 5),
  ],
  EXPERIENCE: [
    option("EXPERIENCE", "Fresher", "0-0", 0),
    option("EXPERIENCE", "0 - 1 years", "0-1", 1),
    option("EXPERIENCE", "1 - 3 years", "1-3", 2),
    option("EXPERIENCE", "3 - 5 years", "3-5", 3),
    option("EXPERIENCE", "5 - 10 years", "5-10", 4),
    option("EXPERIENCE", "10+ years", "10-", 5),
  ],
  KEYWORD: [
    option("KEYWORD", "Urgent Hiring", "Urgent Hiring", 0),
    option("KEYWORD", "Work From Home", "Work From Home", 1),
    option("KEYWORD", "Immediate Joiner", "Immediate Joiner", 2),
    option("KEYWORD", "Walk-in Interview", "Walk-in Interview", 3),
  ],
  EDUCATION: [
    option("EDUCATION", "10th Pass", "10th Pass", 0),
    option("EDUCATION", "12th Pass", "12th Pass", 1),
    option("EDUCATION", "ITI Pass", "ITI Pass", 2),
    option("EDUCATION", "Diploma", "Diploma", 3),
    option("EDUCATION", "Under Graduate (UG)", "Under Graduate (UG)", 4),
    option("EDUCATION", "Post Graduate (PG)", "Post Graduate (PG)", 5),
  ],
  PG_SPECIALIZATION: [
    "Any postgraduate", "MBA / PGDM", "M.Tech", "MS / M.Sc", "MCA", "M.COM", "M.B.B.S.",
    "PG Diploma", "M.A.", "CA", "CS", "ICWA (CMA)", "Integrated PG", "LLM", "M.Ed", "MDS",
    "DM (Doctor of Medicine) Fellowship", "Master of Human Resource Development",
  ].map((label, i) => option("PG_SPECIALIZATION", label, label, i)),
  UG_SPECIALIZATION: [
    "Any graduate", "B.Tech/B.E.", "B.Com", "B.Sc", "Bachelors of Arts", "B.C.A.", "M.B.B.S.",
    "B.B.A. / B.M.S.", "Bachelors of Dental Surgary", "B.Pharma", "LLB - Bachelors of Laws",
    "B.Ed", "B.Arch",
  ].map((label, i) => option("UG_SPECIALIZATION", label, label, i)),
  DIPLOMA_SPECIALIZATION: [
    "Any Specialization", "Diploma in Mechanical Engineering", "Diploma in Electrical Engineering",
    "Diploma in Electronics Engineering", "Diploma in Civil Engineering", "Diploma in Computer Engineering",
    "Diploma in Automobile Engineering", "Diploma in Chemical Engineering", "Diploma in Information Technology",
    "Diploma in Pharmacy (D.Pharma)", "Diploma in Hotel Management", "Diploma in Fashion Designing",
    "Diploma in Interior Designing", "Diploma in Education (D.Ed)", "Post Graduate Diploma",
  ].map((label, i) => option("DIPLOMA_SPECIALIZATION", label, label, i)),
  ITI_SPECIALIZATION: [
    "Any Specialization", "Attendant Operator (Chemical Plant)", "Civil and Mechanical Draughtsman",
    "Computer Operator and Programming Assistant", "Cosmetology", "Electrician",
    "Fashion Design and Technology", "Fitter", "Horticulture",
    "Information Communication Technology System Maintenance", "Machinist", "Mechanic",
    "Plumber", "Technician", "Welder",
  ].map((label, i) => option("ITI_SPECIALIZATION", label, label, i)),
};

function option(type: ManagedOptionType, label: string, value: string, sortOrder: number): ManagedOption {
  return { id: `fallback-${type}-${sortOrder}`, type, label, value, description: null, sortOrder, active: true };
}

export function groupManagedOptions(options: ManagedOption[], includeFallbacks = false): ManagedOptions {
  const grouped = emptyManagedOptions();
  options.forEach((item) => {
    grouped[item.type].push(item);
  });

  if (includeFallbacks) {
    (Object.keys(grouped) as ManagedOptionType[]).forEach((type) => {
      if (!grouped[type].length) grouped[type] = FALLBACKS[type];
    });
  }

  return grouped;
}

export async function getManagedOptions(activeOnly = true, includeFallbacks = true): Promise<ManagedOptions> {
  const rows = await prisma.jobOption.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
  return groupManagedOptions(
    rows.map((row) => ({
      id: row.id,
      type: row.type as ManagedOptionType,
      label: row.label,
      value: row.value,
      description: row.description,
      sortOrder: row.sortOrder,
      active: row.active,
    })),
    includeFallbacks,
  );
}
