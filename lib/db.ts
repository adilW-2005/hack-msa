import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/lib/env";
import * as schema from "@/db/schema";

declare global {
  var __lumenSql: postgres.Sql | undefined;
}

export function getSqlClient() {
  if (!globalThis.__lumenSql) {
    const { DATABASE_URL } = getEnv();
    globalThis.__lumenSql = postgres(DATABASE_URL, {
      prepare: false,
      max: 1,
    });
  }

  return globalThis.__lumenSql;
}

export function getDb() {
  return drizzle(getSqlClient(), { schema });
}

export type Db = ReturnType<typeof getDb>;
