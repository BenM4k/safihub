import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Neither DATABASE_URL_DEV nor DATABASE_URL is set");
}

export default defineConfig({
  schema: "./src/services/db/schema/index.ts",
  out: "./src/services/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
