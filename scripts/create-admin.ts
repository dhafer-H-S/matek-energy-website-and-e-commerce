/**
 * Create or update the first admin user.
 *
 * Usage:
 *   npm run create:admin -- <email> <password> "<name>" [super_admin|editor]
 *
 * If no arguments are passed, sensible defaults are used and a random password
 * is generated and printed.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { randomBytes } from "node:crypto";

async function main() {
  const { db } = await import("../src/lib/db");
  const { users } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = (await import("bcryptjs")).default;

  const email = (process.argv[2] || "admin@matek-energy.com").toLowerCase();
  const password =
    process.argv[3] || randomBytes(9).toString("base64url");
  const name = process.argv[4] || "Matek Admin";
  const role = (process.argv[5] as "super_admin" | "editor") || "super_admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name, role, active: true })
      .where(eq(users.id, existing.id));
    console.log(`\n✓ Updated existing admin: ${email}`);
  } else {
    await db.insert(users).values({ email, passwordHash, name, role });
    console.log(`\n✓ Created admin: ${email}`);
  }

  console.log("──────────────────────────────────────────");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     ${role}`);
  console.log("──────────────────────────────────────────");
  console.log("  Sign in at /admin/login\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
