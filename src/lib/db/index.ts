import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error(
    "Missing TURSO_DATABASE_URL. Set the remote Turso database URL and TURSO_AUTH_TOKEN in Vercel Project Settings > Environment Variables for this deployment's environment, then redeploy. For local development, configure .env.local.",
  );
}
if (process.env.VERCEL && databaseUrl.startsWith("file:")) {
  throw new Error(
    "A local file database cannot be used on Vercel. Set TURSO_DATABASE_URL to your remote libsql:// Turso URL and configure TURSO_AUTH_TOKEN, then redeploy.",
  );
}

const globalForDb = globalThis as unknown as {
  __matekLibsql?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.__matekLibsql ??
  createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__matekLibsql = client;
}

export const db = drizzle(client, { schema });
export { schema };
