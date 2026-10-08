import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Resolves the database connection URL based on runtime environment.
 * Development uses DATABASE_URL_DEV (pointing to neondb_dev on Neon).
 * Production uses DATABASE_URL_PROD (or DATABASE_URL / DATABASE_URL_POOLED).
 */
export function getDatabaseUrl(): string {
  if (process.env.NODE_ENV === "development" && process.env.DATABASE_URL_DEV) {
    return process.env.DATABASE_URL_DEV;
  }
  const url =
    process.env.DATABASE_URL_POOLED ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_DEV;

  if (!url) {
    throw new Error(
      "DATABASE_URL or DATABASE_URL_DEV environment variable is not configured."
    );
  }
  return url;
}

const connectionString = getDatabaseUrl();
const pool = new Pool({ connectionString });

/**
 * SafiHub Drizzle ORM client with full modular relational schema.
 */
export const db = drizzle(pool, { schema });

export type Database = typeof db;
export { schema };
