import { describe, expect, it } from "vitest";
import { isItemQid, toQid, toSparqlRows } from "./sparqlRows.ts";

describe("toSparqlRows", () => {
  it("keeps only the values of each binding", () => {
    expect(toSparqlRows([{ item: { value: "x" }, label: { value: "y" } }])).toEqual([
      { item: "x", label: "y" },
    ]);
  });
});

describe("toQid", () => {
  it("reads the identifier at the end of an entity address", () => {
    expect(toQid("http://www.wikidata.org/entity/Q30034")).toBe("Q30034");
  });

  it("reads nothing from a missing address", () => {
    expect(toQid(undefined)).toBe("");
  });
});

describe("isItemQid", () => {
  it("accepts an item identifier", () => {
    expect(isItemQid("Q30034")).toBe(true);
  });

  it("rejects a lexeme sense identifier", () => {
    expect(isItemQid("L1375480-S1")).toBe(false);
  });
});
