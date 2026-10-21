import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { locatedObservationsSql } from "./studySites.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

/**
 * Opens an in-memory database with every migration applied, holding a located interaction
 * between a bee and a clover, and an unlocated one between the bee and a pine.
 */
function openDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec(`INSERT INTO nodes (id, kind, label, source) VALUES
    ('bee', 'organism', 'Apis mellifera', 'sample'),
    ('clover', 'organism', 'Trifolium', 'mangal'),
    ('pine', 'organism', 'Pinus', 'globi');
  INSERT INTO connections (source_node_id, target_node_id, kind, relation, basis, place, latitude, longitude, source, licence) VALUES
    ('bee', 'clover', 'interaction', 'pollinates', 'observed', 'Mt. Yufu', 33.4, 131.5, 'mangal', 'CC0-1.0'),
    ('bee', 'pine', 'interaction', 'visits', 'observed', NULL, NULL, NULL, 'globi', 'CC0-1.0');`);
  return db;
}

describe("locatedObservationsSql run against the schema", () => {
  it("selects both organisms of each located interaction, and no others", () => {
    const rows = openDatabase().prepare(locatedObservationsSql).all();
    expect(rows.map(({ nodeId }) => nodeId)).toEqual(["bee", "clover"]);
  });
});
