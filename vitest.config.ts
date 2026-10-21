import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const migrationsPath = path.resolve("db/migrations");

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: "./wrangler.jsonc" },
            miniflare: { bindings: { TEST_MIGRATIONS: readMigrations() } },
          }),
        ],
        test: {
          name: "worker",
          include: ["src/worker/**/*.test.ts"],
          setupFiles: ["src/worker/test/isolateDatabase.ts"],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "client",
          include: ["src/client/**/*.test.{ts,tsx}"],
          environment: "jsdom",
        },
      },
      {
        test: {
          name: "shared",
          include: ["src/shared/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "scripts",
          include: ["scripts/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});

function readMigrations() {
  return readdirSync(migrationsPath)
    .sort()
    .map((file) => readFileSync(path.join(migrationsPath, file), "utf8"));
}
