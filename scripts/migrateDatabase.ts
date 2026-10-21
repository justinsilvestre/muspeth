import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

type Migration = { version: number; sql: string };

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

/**
 * Applies, in order, each migration newer than the database's schema version.
 * Each migration and the version it brings run in one transaction.
 */
export function migrateDatabase(db: DatabaseSync, migrations: Migration[]) {
  const pending = migrations.filter(({ version }) => version > readSchemaVersion(db));
  for (const migration of pending) applyMigration(db, migration);
  return pending;
}

/** Reads the files in `db/migrations`, numbered by the prefix of each name, such as 0001. */
export function readMigrations() {
  return readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => ({
      version: Number.parseInt(file, 10),
      sql: readFileSync(path.join(migrationsPath, file), "utf8"),
    }));
}

/** Reads the version of the last migration applied to the database, or 0 for an empty one. */
export function readSchemaVersion(db: DatabaseSync) {
  return Number(db.prepare("PRAGMA user_version").get()?.user_version);
}

function applyMigration(db: DatabaseSync, { version, sql }: Migration) {
  db.exec("BEGIN;");
  try {
    db.exec(`${sql}\nPRAGMA user_version = ${version};`);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}
