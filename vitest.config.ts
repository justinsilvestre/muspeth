import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { openSqlDatabaseInNode, precomputeResponses } from "./build/precomputeResponses";

const migrationsPath = path.resolve("db/migrations");
const migrations = readMigrations();
const seed = readFileSync(path.resolve("db/seed.sql"), "utf8");

export default defineConfig(async () => ({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: "./wrangler.jsonc" },
            miniflare: {
              bindings: {
                TEST_MIGRATIONS: migrations,
                TEST_SEED: seed,
                TEST_PRECOMPUTED_RESPONSES: await precomputeSampleResponses(),
              },
            },
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
}));

function readMigrations() {
  return readdirSync(migrationsPath)
    .sort()
    .map((file) => readFileSync(path.join(migrationsPath, file), "utf8"));
}

/** Precomputes the responses in Node, for the Worker tests to compare with the Worker's own answers. */
async function precomputeSampleResponses() {
  const db = await openSqlDatabaseInNode();
  for (const sql of [...migrations, seed]) db.exec(sql);
  return precomputeResponses(db);
}
