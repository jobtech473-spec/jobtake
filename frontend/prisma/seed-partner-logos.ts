import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOGOS = [
  { name: "Teleperformance", logoUrl: "https://framerusercontent.com/images/6MqbXWXucqBYjTm6hzP0YJ0JLo.png?width=300&height=54" },
  { name: "Bajaj Allianz",   logoUrl: "https://framerusercontent.com/images/RdDC2YtfhCyahB7DK6vUOY6Sr0.png?width=368&height=128" },
  { name: "Flipkart",        logoUrl: "https://cdn.worldvectorlogo.com/logos/flipkart.svg" },
  { name: "bigbasket",       logoUrl: "https://framerusercontent.com/images/BP0vuq7mtsXsInJhngcYqwUFk4.png?width=1030&height=309" },
  { name: "Swiggy",          logoUrl: "https://cdn.worldvectorlogo.com/logos/swiggy-1.svg" },
  { name: "Uber",            logoUrl: "https://cdn.worldvectorlogo.com/logos/uber-2.svg" },
  { name: "Urban Company",   logoUrl: "https://framerusercontent.com/images/zIskNwdwEZJloMkOYtEQfhGA7fY.png?width=1202&height=339" },
  { name: "Zomato",          logoUrl: "https://cdn.worldvectorlogo.com/logos/zomato-2.svg" },
  { name: "Fresh Dunya",     logoUrl: "https://framerusercontent.com/images/YALf4vlwSXrvH9eskRLGLLihnUM.png?width=292&height=128" },
  { name: "Shoppers Stop",   logoUrl: "https://framerusercontent.com/images/KCRiFij6lCCsfiAwvBcnLZGZN4.png?width=544&height=128" },
];

async function main() {
  const existing = await prisma.partnerLogo.count();
  if (existing > 0) {
    console.log(`PartnerLogo already has ${existing} rows — skipping seed.`);
    return;
  }
  for (let i = 0; i < LOGOS.length; i++) {
    await prisma.partnerLogo.create({ data: { ...LOGOS[i], sortOrder: i } });
  }
  console.log(`Seeded ${LOGOS.length} partner logos.`);
}

main().finally(() => prisma.$disconnect());
