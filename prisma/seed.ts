/**
 * Seed script.
 *
 * Creates the primary OWNER admin account (laglitz@gmail.com / LAGLITZ) and
 * seeds the default site settings into the SiteSetting table. Does NOT seed
 * any products — the owner publishes those via Blogger.
 *
 * Run with: `bun prisma/seed.ts`
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/site/defaults";

const db = new PrismaClient();

async function main() {
  const email = "laglitz@gmail.com";
  const password = "LAGLITZ";
  const name = "Charity Kessewaa Frimpong";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await db.adminUser.upsert({
    where: { email },
    update: { name, role: "OWNER", isActive: true, passwordHash },
    create: {
      email,
      name,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  console.log(`Seeded OWNER admin: ${admin.email} (${admin.id})`);

  const settings = { ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() };
  await db.siteSetting.upsert({
    where: { key: "site.settings" },
    update: { value: JSON.stringify(settings) },
    create: { key: "site.settings", value: JSON.stringify(settings) },
  });

  console.log("Seeded site settings.");

  console.log("\nAdmin login:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
