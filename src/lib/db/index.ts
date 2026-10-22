import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __matekLibsql?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.__matekLibsql ??
  createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__matekLibsql = client;
}

export const db = drizzle(client, { schema });
export { schema };
