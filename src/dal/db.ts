import "server-only";

export { db, getDatabaseUrl, type Database, schema } from "../services/db";

/**
 * Escapes LIKE/ILIKE wildcard characters (`%`, `_`, `\`) in user-supplied search queries.
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}
