import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { toConnectionImportSql } from "./connectionImportSql.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import { type NodeMediaLink, toNodeMediaSql } from "./nodeMediaSql.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

const beePhoto = {
  nodeId: "bee",
  media: { url: "https://example.org/bee.jpg", licence: "CC-BY-SA-4.0", credit: "A. Person" },
} satisfies NodeMediaLink;

/** Opens an in-memory database with every migration applied and a bee and a pine in it. */
function openDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  db.exec(`INSERT INTO nodes (id, kind, label) VALUES ('bee', 'organism', 'Apis mellifera');
    INSERT INTO nodes (id, kind, label) VALUES ('pine', 'organism', 'Pinus densiflora');`);
  return db;
}

function readMedia(db: DatabaseSync, nodeId: string) {
  return db
    .prepare("SELECT media_url, media_licence, media_credit, media_source FROM nodes WHERE id = ?")
    .get(nodeId);
}

describe("toNodeMediaSql run against the schema", () => {
  it("links the media to the node under its licence, credit and import", () => {
    const db = openDatabase();
    db.exec(toNodeMediaSql("photos", [beePhoto]));
    expect(readMedia(db, "bee")).toEqual({
      media_url: "https://example.org/bee.jpg",
      media_licence: "CC-BY-SA-4.0",
      media_credit: "A. Person",
      media_source: "photos",
    });
  });

  it("leaves the same media when run twice", () => {
    const db = openDatabase();
    db.exec(toNodeMediaSql("photos", [beePhoto]));
    const first = readMedia(db, "bee");
    db.exec(toNodeMediaSql("photos", [beePhoto]));
    expect(readMedia(db, "bee")).toEqual(first);
  });

  it("removes media that the import's earlier run linked and this one does not", () => {
    const db = openDatabase();
    db.exec(toNodeMediaSql("photos", [beePhoto]));
    db.exec(toNodeMediaSql("photos", []));
    expect(readMedia(db, "bee")?.media_url).toBeNull();
  });

  it("keeps media that another import linked", () => {
    const db = openDatabase();
    db.exec(toNodeMediaSql("other", [beePhoto]));
    db.exec(toNodeMediaSql("photos", [{ ...beePhoto, media: { url: "x", licence: "CC0-1.0" } }]));
    expect(readMedia(db, "bee")?.media_source).toBe("other");
  });

  it("keeps the media when the import that added the node runs again", () => {
    const db = openDatabase();
    const bee = { id: "bee", kind: "organism", label: "Apis mellifera", names: [] };
    db.exec(toConnectionImportSql("sample", [bee satisfies NodeDraft], []));
    db.exec(toNodeMediaSql("photos", [beePhoto]));
    db.exec(toConnectionImportSql("sample", [bee satisfies NodeDraft], []));
    expect(readMedia(db, "bee")?.media_source).toBe("photos");
  });
});
