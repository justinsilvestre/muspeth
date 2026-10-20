import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { type NetworkCopy, toNetworkCopiesSql } from "./networkCopiesSql.ts";

const migrationsPath = path.resolve(import.meta.dirname, "../db/migrations");

const webOfLifeCopy = {
  canonicalNetworkId: "mangal:948",
  collection: "web-of-life",
  networkId: "M_PL_056",
  url: "http://www.web-of-life.es/map.php?type=5",
} satisfies NetworkCopy;

function openDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrationsPath).sort()) {
    db.exec(readFileSync(path.join(migrationsPath, file), "utf8"));
  }
  return db;
}

function countCopies(db: DatabaseSync) {
  return db.prepare("SELECT COUNT(*) AS count FROM network_copies").get()?.count;
}

describe("toNetworkCopiesSql run against the schema", () => {
  it("leaves the same rows when run twice", () => {
    const db = openDatabase();
    db.exec(toNetworkCopiesSql("mangal", [webOfLifeCopy]));
    db.exec(toNetworkCopiesSql("mangal", [webOfLifeCopy]));
    expect(countCopies(db)).toBe(1);
  });

  it("keeps the copies that other imports recorded", () => {
    const db = openDatabase();
    db.exec(toNetworkCopiesSql("web-of-life", [webOfLifeCopy]));
    db.exec(toNetworkCopiesSql("mangal", []));
    expect(countCopies(db)).toBe(1);
  });

  it("stores a copy whose identifier is unknown", () => {
    const db = openDatabase();
    db.exec(toNetworkCopiesSql("mangal", [{ ...webOfLifeCopy, networkId: null }]));
    expect(db.prepare("SELECT network_id FROM network_copies").get()?.network_id).toBeNull();
  });
});
