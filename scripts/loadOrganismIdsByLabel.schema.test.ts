import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { toOrganismIdsByLabel, toOrganismsOutsideSourcesSql } from "./loadOrganismIdsByLabel.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

/** Opens an in-memory database with every migration applied and three clover nodes in it. */
function openDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec(`INSERT INTO nodes (id, kind, label, source) VALUES
    ('a-clover', 'organism', 'Trifolium', 'globi'),
    ('b-clover', 'organism', 'Trifolium', 'sample'),
    ('c-clover', 'organism', 'Trifolium', 'mangal'),
    ('word', 'word', 'Trifolium', 'wold');`);
  return db;
}

function loadIdsByLabel(db: DatabaseSync, excludedSources: string[]) {
  const rows = db.prepare(toOrganismsOutsideSourcesSql(excludedSources)).all();
  return toOrganismIdsByLabel(
    rows.map(({ id, label }) => ({ id: String(id), label: String(label) })),
  );
}

describe("loadOrganismIdsByLabel's query run against the schema", () => {
  it("prefers the sample's organism to those of other sources", () => {
    expect(loadIdsByLabel(openDatabase(), []).get("Trifolium")).toBe("b-clover");
  });

  it("finds organisms of any source that is not excluded", () => {
    expect(loadIdsByLabel(openDatabase(), ["sample"]).get("Trifolium")).toBe("a-clover");
  });

  it("leaves out organisms of the excluded sources", () => {
    const idsByLabel = loadIdsByLabel(openDatabase(), ["sample", "globi"]);
    expect(idsByLabel.get("Trifolium")).toBe("c-clover");
  });

  it("leaves out nodes that are not organisms", () => {
    const idsByLabel = loadIdsByLabel(openDatabase(), ["sample", "globi", "mangal"]);
    expect(idsByLabel.size).toBe(0);
  });
});
