import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { databasePath } from "./database.ts";
import { migrateDatabase, readMigrations, readSchemaVersion } from "./migrateDatabase.ts";

const migrations = [
  { version: 1, sql: "CREATE TABLE birds (id INTEGER);" },
  { version: 2, sql: "ALTER TABLE birds ADD COLUMN name TEXT;" },
];

function listColumns(db: DatabaseSync) {
  return db
    .prepare("SELECT name FROM pragma_table_info('birds')")
    .all()
    .map(({ name }) => name);
}

describe("migrateDatabase", () => {
  it("applies every migration to an empty database", () => {
    const db = new DatabaseSync(":memory:");
    migrateDatabase(db, migrations);
    expect(listColumns(db)).toEqual(["id", "name"]);
  });

  it("records the version of the last migration it applied", () => {
    const db = new DatabaseSync(":memory:");
    migrateDatabase(db, migrations);
    expect(readSchemaVersion(db)).toBe(2);
  });

  it("skips the migrations already applied", () => {
    const db = new DatabaseSync(":memory:");
    migrateDatabase(db, migrations.slice(0, 1));
    expect(() => migrateDatabase(db, migrations)).not.toThrow();
  });

  it("keeps none of a migration's changes when it fails", () => {
    const db = new DatabaseSync(":memory:");
    const failing = { version: 3, sql: "CREATE TABLE nests (id INTEGER); SELECT * FROM missing;" };
    expect(() => migrateDatabase(db, [...migrations, failing])).toThrow();
    expect(readSchemaVersion(db)).toBe(2);
  });
});

describe("readMigrations", () => {
  it("numbers each migration by the prefix of its file name", () => {
    const versions = readMigrations().map(({ version }) => version);
    expect(versions.slice(0, 2)).toEqual([1, 2]);
  });
});

describe("the database file", () => {
  it("has every migration applied", () => {
    const db = new DatabaseSync(databasePath, { readOnly: true });
    expect(readSchemaVersion(db)).toBe(readMigrations().at(-1)?.version);
  });
});
