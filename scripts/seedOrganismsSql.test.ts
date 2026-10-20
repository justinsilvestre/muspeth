import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { seedOrganismsSql } from "./seedOrganismsSql.ts";

const dbPath = path.resolve(import.meta.dirname, "../db");

/** Opens an in-memory database with every migration and the seed applied. */
function openSeededDatabase() {
  const db = new DatabaseSync(":memory:");
  const migrationsPath = path.join(dbPath, "migrations");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec(readFileSync(path.join(dbPath, "seed.sql"), "utf8"));
  return db;
}

function listSeedLabels(db: DatabaseSync) {
  return db
    .prepare(seedOrganismsSql)
    .all()
    .map((row) => String(row.label))
    .sort();
}

describe("seedOrganismsSql", () => {
  it("lists the seed's organisms", () => {
    expect(listSeedLabels(openSeededDatabase())).toEqual([
      "Apis mellifera",
      "Bursaphelenchus xylophilus",
      "Monochamus alternatus",
      "Pinus densiflora",
      "Tricholoma matsutake",
    ]);
  });

  it("leaves out organisms that imports added", () => {
    const db = openSeededDatabase();
    db.exec(`INSERT INTO nodes (id, kind, label, source) VALUES
      ('gbif:1', 'organism', 'Bombus terrestris', 'mangal'),
      ('gbif:2', 'organism', 'Trifolium repens', 'globi');`);
    expect(listSeedLabels(db)).toHaveLength(5);
  });
});
