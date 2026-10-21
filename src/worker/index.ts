import app from "./app";
import { devServerFiles, loadDatabase } from "./loadDatabase";
import type { SqlDatabase } from "./sqlDatabase";

let database: Promise<SqlDatabase> | undefined;

export default {
  async fetch(request, env, context) {
    const files = env.DATABASE_FROM_DEV_SERVER ? devServerFiles(request) : env.ASSETS;
    return app.fetch(request, { DB: await loadDatabaseOnce(files) }, context);
  },
} satisfies ExportedHandler<Env & { DATABASE_FROM_DEV_SERVER?: string }>;

/** Loads the database once per isolate, trying again on the next request if loading fails. */
function loadDatabaseOnce(files: Parameters<typeof loadDatabase>[0]) {
  database ??= loadDatabase(files).catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}
