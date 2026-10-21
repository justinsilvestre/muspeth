import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { migrateDatabase, readMigrations } from "./migrateDatabase.ts";

const beeId = "wikidata:Q30034";

/**
 * Opens an in-memory database migrated up to the restoring migration,
 * holding the bee and another organism, both credited to Mangal.
 */
function openDatabase() {
  const migrations = readMigrations();
  const db = new DatabaseSync(":memory:");
  migrateDatabase(
    db,
    migrations.filter(({ version }) => version < 8),
  );
  db.exec(`INSERT INTO nodes (id, kind, label, source) VALUES
    ('${beeId}', 'organism', 'Apis mellifera', 'mangal'),
    ('wikidata:Q156928', 'organism', 'Trifolium repens', 'mangal');`);
  migrateDatabase(db, migrations);
  return db;
}

function readSource(db: DatabaseSync, nodeId: string) {
  return db.prepare("SELECT source FROM nodes WHERE id = ?").get(nodeId)?.source;
}

describe("the migration restoring the sample bee's source", () => {
  it("credits the bee to the sample again", () => {
    expect(readSource(openDatabase(), beeId)).toBe("sample");
  });

  it("leaves other organisms' sources alone", () => {
    expect(readSource(openDatabase(), "wikidata:Q156928")).toBe("mangal");
  });
});
