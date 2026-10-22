import { config } from "dotenv";
import { createClient, type InStatement, type Row } from "@libsql/client";
import path from "node:path";
import assert from "node:assert/strict";

config({ path: ".env.local", quiet: true });

const targetUrl = "libsql://matek-energy-website-and-e-commerce-dhaferhs.aws-us-east-1.turso.io";
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;

async function main() {
  if (process.env.TURSO_DATABASE_URL?.trim() !== targetUrl) {
    throw new Error(`Set TURSO_DATABASE_URL in the Matek .env.local to ${targetUrl}. No database has been changed.`);
  }
  const token = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!token) throw new Error("Set TURSO_AUTH_TOKEN to a database auth token generated for the Matek database.");
  const source = createClient({ url: `file:${path.resolve("data/matek.db")}` });
  const target = createClient({ url: targetUrl, authToken: token });
  try {
    const sourceSchema = await source.execute("SELECT type, name, sql FROM sqlite_master WHERE type IN ('table', 'index') AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY type DESC, name");
    const tables = sourceSchema.rows.filter((row) => row.type === "table");
    const names = new Set(tables.map((row) => String(row.name)));
    for (const name of ["products", "services", "categories", "orders", "site_content", "email_notifications"]) {
      assert.ok(names.has(name), `The source is not the complete Matek database: missing ${name}.`);
    }
    const snapshot = new Map<string, Row[]>();
    for (const table of tables) {
      const name = String(table.name);
      snapshot.set(name, (await source.execute(`SELECT * FROM ${quote(name)}`)).rows);
    }
    const existing = await target.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
    if (existing.rows.length) {
      throw new Error("The remote Matek database already contains tables. Transfer stopped without changing it. Review existing data before merging.");
    }
    const statements: InStatement[] = [{ sql: "PRAGMA defer_foreign_keys = ON", args: [] }];
    for (const row of tables) statements.push({ sql: String(row.sql), args: [] });
    for (const [name, rows] of snapshot) {
      for (const row of rows) {
        const columns = Object.keys(row);
        statements.push({
          sql: `INSERT INTO ${quote(name)} (${columns.map(quote).join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
          args: columns.map((column) => row[column]),
        });
      }
    }
    for (const row of sourceSchema.rows.filter((row) => row.type === "index")) {
      statements.push({ sql: String(row.sql), args: [] });
    }
    await target.batch(statements, "write");
    for (const [name, rows] of snapshot) {
      const remote = await target.execute(`SELECT * FROM ${quote(name)}`);
      const normalize = (values: Row[]) => values.map((row) => JSON.stringify(
        Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))),
        (_key, value) => typeof value === "bigint" ? String(value) : value,
      )).sort();
      assert.deepEqual(normalize(remote.rows), normalize(rows), `Verification failed for ${name}; local source is unchanged.`);
      console.log(`Verified ${name}: ${rows.length} records`);
    }
    assert.equal((await target.execute("PRAGMA foreign_key_check")).rows.length, 0, "Remote database has foreign-key violations.");
    console.log("Matek transfer completed and every record verified. Local Matek data and the Aura database were not modified.");
  } finally {
    source.close();
    target.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database transfer failed.");
  process.exitCode = 1;
});
