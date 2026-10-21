import initSqlJs from "sql.js";
import { precomputedResponsePaths } from "../src/shared/precomputedResponsePaths";
import app from "../src/worker/app";
import { SqlDatabase } from "../src/worker/sqlDatabase";

/** Opens a SQLite database in Node, from the contents of a database file or else empty. */
export async function openSqlDatabaseInNode(bytes?: Uint8Array) {
  const { Database } = await initSqlJs();
  return new SqlDatabase(new Database(bytes));
}

/** Answers each API request that has a precomputed response, keyed by the path of the static file. */
export async function precomputeResponses(db: SqlDatabase) {
  const entries = Object.entries(precomputedResponsePaths).map(
    async ([apiPath, filePath]) => [filePath, await requestText(db, apiPath)] as const,
  );
  return Object.fromEntries(await Promise.all(entries));
}

async function requestText(db: SqlDatabase, apiPath: string) {
  const response = await app.request(apiPath, {}, { DB: db });
  if (!response.ok) throw new Error(`${apiPath} answered HTTP ${response.status}`);
  return response.text();
}
