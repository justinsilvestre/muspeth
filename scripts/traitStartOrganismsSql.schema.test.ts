import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { traitStartOrganismsSql } from "./traitStartOrganismsSql.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

/**
 * Opens an in-memory database with every migration applied, holding the seed's bee, a clover that
 * the likeness import holds but GloBI connects, and a wren that only likeness and a word connect.
 */
function openDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec(`INSERT INTO nodes (id, kind, label, source) VALUES
    ('bee', 'organism', 'Apis mellifera', 'sample'),
    ('clover', 'organism', 'Trifolium', 'eltontraits'),
    ('wren', 'organism', 'Troglodytes', 'eltontraits'),
    ('word', 'word', 'wren', 'wold');
  INSERT INTO connections (source_node_id, target_node_id, kind, relation, basis, source, licence) VALUES
    ('bee', 'clover', 'interaction', 'pollinates', 'observed', 'globi', 'CC0-1.0'),
    ('clover', 'wren', 'likeness', 'resembles', 'computed', 'eltontraits', 'CC0-1.0'),
    ('wren', 'word', 'shared_words_and_stories', 'is called', 'attributed', 'wold', 'CC-BY-4.0');`);
  return db;
}

function listStartIds(db: DatabaseSync) {
  return db
    .prepare(traitStartOrganismsSql)
    .all()
    .map(({ id }) => id);
}

describe("traitStartOrganismsSql run against the schema", () => {
  it("selects the seed's organisms and those with an interaction, whatever their source", () => {
    expect(listStartIds(openDatabase())).toEqual(["bee", "clover"]);
  });
});
