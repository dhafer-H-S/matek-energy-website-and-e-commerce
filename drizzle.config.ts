import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("Missing TURSO_DATABASE_URL. Configure your database URL in .env.local or the command environment before running database commands.");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
  verbose: true,
  strict: true,
});
