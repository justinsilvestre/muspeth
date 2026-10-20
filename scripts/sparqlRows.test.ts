import { describe, expect, it } from "vitest";
import { toQid, toSparqlRows } from "./sparqlRows.ts";

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
