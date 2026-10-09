// Resets the admin account's password.
//
//   ADMIN_EMAIL=admin@jobtake.com NEW_PASSWORD=yourNewPassword npx tsx prisma/reset-admin-password.ts
//
// If NEW_PASSWORD is omitted, a random one is generated and printed.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@jobtake.com").toLowerCase();
  const password = process.env.NEW_PASSWORD || randomBytes(9).toString("base64url");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 11) },
  });

  console.log(`NEW LOGIN  ${email}  /  ${password}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
