import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/** The database file that imports write to and that each deploy ships, unless `DATABASE_PATH` names another. */
export const databasePath =
  process.env.DATABASE_PATH ?? path.resolve(import.meta.dirname, "../db/muspeth.sqlite");

let database: DatabaseSync | undefined;

/** Opens the database file once, enforcing foreign keys as the deployed database always has. */
export function openDatabase() {
  database ??= new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  return database;
}

/** Runs a query against the database and returns its rows. */
export function queryDatabase<Row>(sql: string) {
  return openDatabase().prepare(sql).all() as Row[];
}

/** Runs a script of SQL statements against the database, keeping none of its changes if one fails. */
export function executeSqlScript(sql: string) {
  const db = openDatabase();
  db.exec("BEGIN;");
  try {
    db.exec(sql);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}
