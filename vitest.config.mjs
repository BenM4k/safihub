import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["node_modules/**", "e2e/**"],
    alias: {
      "server-only": path.resolve(__dirname, "./empty-server-only.js"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
