/**
 * Promote a user to ADMIN by email. Run this AFTER the person has signed in
 * at least once (so their User row exists), e.g.:
 *
 *   npx ts-node prisma/make-admin.ts you@gmail.com
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx ts-node prisma/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`${user.email} is now an ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
