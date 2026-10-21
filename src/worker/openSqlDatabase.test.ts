import { describe, expect, it } from "vitest";
import { openSqlDatabase } from "./openSqlDatabase";

async function openWithBirds() {
  const db = await openSqlDatabase();
  db.exec("CREATE TABLE birds (id INTEGER, name TEXT); INSERT INTO birds VALUES (1, 'wren');");
  return db;
}

describe("openSqlDatabase", () => {
  it("lists every row a query returns", async () => {
    const db = await openWithBirds();
    const { results } = await db.prepare("SELECT id, name FROM birds").all();
    expect(results).toEqual([{ id: 1, name: "wren" }]);
  });

  it("binds values to the placeholders in a query", async () => {
    const db = await openWithBirds();
    const { results } = await db.prepare("SELECT ? AS a, ? AS b").bind("x", 2).all();
    expect(results).toEqual([{ a: "x", b: 2 }]);
  });

  it("reads the first row a query returns", async () => {
    const db = await openWithBirds();
    expect(await db.prepare("SELECT name FROM birds").first()).toEqual({ name: "wren" });
  });

  it("reads null when a query returns no row", async () => {
    const db = await openWithBirds();
    expect(await db.prepare("SELECT name FROM birds WHERE id = 2").first()).toBeNull();
  });

  it("runs statements in order", async () => {
    const db = await openWithBirds();
    await db.batch([
      db.prepare("INSERT INTO birds VALUES (2, 'tit')"),
      db.prepare("DELETE FROM birds WHERE id = ?").bind(1),
    ]);
    const { results } = await db.prepare("SELECT id FROM birds").all();
    expect(results).toEqual([{ id: 2 }]);
  });

  it("opens the database stored in the given bytes", async () => {
    const original = await openWithBirds();
    const copy = await openSqlDatabase(original.export());
    expect(await copy.prepare("SELECT name FROM birds").first()).toEqual({ name: "wren" });
  });
});
