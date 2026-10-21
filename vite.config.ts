import { readFileSync } from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { openSqlDatabaseInNode, precomputeResponses } from "./build/precomputeResponses";
import { precomputedResponsePaths } from "./src/shared/precomputedResponsePaths";
import { databaseAssetPath } from "./src/worker/databaseAssetPath";

const databasePath = process.env.DATABASE_PATH ?? path.resolve("db/muspeth.sqlite");

export default defineConfig(({ command }) => ({
  // Worktrees symlink node_modules to the main checkout, so the default cache
  // inside node_modules would be shared and overwritten between dev servers.
  cacheDir: ".vite",
  plugins: [
    databaseAsset(),
    precomputedResponses(),
    react(),
    tailwindcss(),
    // The assets binding serves only HTML in development, so the Worker reads the database from Vite.
    cloudflare({
      config: command === "serve" ? { vars: { DATABASE_FROM_DEV_SERVER: "true" } } : {},
    }),
  ],
}));

/** Serves the database file to the Worker in development, and adds it to the built static assets. */
function databaseAsset() {
  return {
    name: "database-asset",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(databaseAssetPath, (_request, response) => {
        response.setHeader("Content-Type", "application/vnd.sqlite3");
        response.end(readFileSync(databasePath));
      });
    },
    generateBundle() {
      if (this.environment.name !== "client") return;
      const fileName = databaseAssetPath.slice(1);
      this.emitFile({ type: "asset", fileName, source: readFileSync(databasePath) });
    },
  } satisfies Plugin;
}

/** Serves the precomputed API responses in development, and adds them to the built static assets. */
function precomputedResponses() {
  const filePaths = new Set<string>(Object.values(precomputedResponsePaths));
  return {
    name: "precomputed-responses",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        if (!filePaths.has(pathname)) return next();
        const responses = await precomputeFromDatabaseFile();
        response.setHeader("Content-Type", "application/json");
        response.end(responses[pathname]);
      });
    },
    async generateBundle() {
      if (this.environment.name !== "client") return;
      const responses = await precomputeFromDatabaseFile();
      for (const [filePath, source] of Object.entries(responses))
        this.emitFile({ type: "asset", fileName: filePath.slice(1), source });
    },
  } satisfies Plugin;
}

async function precomputeFromDatabaseFile() {
  return precomputeResponses(await openSqlDatabaseInNode(readFileSync(databasePath)));
}
