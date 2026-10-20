import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { toConnectionImportSql } from "./connectionImportSql.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

const bee = { id: "bee", kind: "organism", label: "Apis mellifera", names: [] } satisfies NodeDraft;
const clover = {
  id: "clover",
  kind: "organism",
  label: "Trifolium",
  names: [],
} satisfies NodeDraft;

function makeConnection(targetNodeId: string) {
  return {
    sourceNodeId: "bee",
    targetNodeId,
    kind: "interaction",
    relation: "pollinates",
    basis: "observed",
    taxonomicLevel: "species",
    licence: "CC0-1.0",
    qualityFlags: [],
    sources: [
      {
        datasetId: "one",
        datasetCitation: null,
        studyCitation: "A study.",
        studyUrl: null,
        recordCount: 1,
      },
    ],
  } satisfies ConnectionDraft;
}

/** Opens an in-memory database with every migration applied and the seed's bee in it. */
function openDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec("INSERT INTO nodes (id, kind, label) VALUES ('bee', 'organism', 'Apis mellifera');");
  return db;
}

/** Runs an import the way a script does, reading its earlier nodes from the database. */
function runImport(db: DatabaseSync, source: string, connections: ConnectionDraft[]) {
  const previousIds = db
    .prepare("SELECT id FROM nodes WHERE source = ?")
    .all(source)
    .map((row) => String(row.id));
  db.exec(toConnectionImportSql(source, [bee, clover], connections, previousIds));
}

function runDroppingClover(db: DatabaseSync) {
  db.exec(toConnectionImportSql("test", [bee], [], ["clover"]));
}

function countRows(db: DatabaseSync) {
  const tables = ["nodes", "node_names", "connections", "connection_sources"];
  return tables.map((table) => db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count);
}

function readCloverSource(db: DatabaseSync) {
  return db.prepare("SELECT source FROM nodes WHERE id = 'clover'").get()?.source;
}

describe("toConnectionImportSql run against the schema", () => {
  it("leaves the same rows when run twice", () => {
    const db = openDatabase();
    runImport(db, "test", [makeConnection("clover")]);
    const firstCounts = countRows(db);
    runImport(db, "test", [makeConnection("clover")]);
    expect(countRows(db)).toEqual(firstCounts);
  });

  it("keeps the seed's nodes as they are", () => {
    const db = openDatabase();
    runImport(db, "test", [makeConnection("clover")]);
    expect(db.prepare("SELECT source FROM nodes WHERE id = 'bee'").get()?.source).toBe("sample");
  });

  it("removes a node that the import's earlier run added and this one does not", () => {
    const db = openDatabase();
    runImport(db, "test", [makeConnection("clover")]);
    runDroppingClover(db);
    expect(readCloverSource(db)).toBeUndefined();
  });

  it("hands a dropped node to another import that still connects it", () => {
    const db = openDatabase();
    runImport(db, "test", [makeConnection("clover")]);
    runImport(db, "other", [makeConnection("clover")]);
    runDroppingClover(db);
    expect(readCloverSource(db)).toBe("other");
  });

  it("keeps the taxon placements of nodes added again", () => {
    const db = openDatabase();
    runImport(db, "test", [makeConnection("clover")]);
    db.exec(`INSERT INTO taxa (id, rank, name, source, licence) VALUES ('t', 'genus', 'Trifolium', 'gbif', 'CC-BY-4.0');
      INSERT INTO taxon_placements (node_id, taxon_id) VALUES ('clover', 't');`);
    runImport(db, "test", [makeConnection("clover")]);
    expect(db.prepare("SELECT COUNT(*) AS count FROM taxon_placements").get()?.count).toBe(1);
  });
});
