import { describe, expect, it } from "vitest";
import { contradictsGbif, findGbifKey, toGbifTaxon } from "./gbifTaxon.ts";

const fungusItem = {
  qid: "Q16528286",
  taxonNames: ["Amphinema"],
  labels: [],
  externalIds: ["gbif:2554032", "ncbi:137744"],
};

describe("findGbifKey", () => {
  it("reads the key of a GBIF identifier", () => {
    expect(findGbifKey("gbif:2554032", new Map())).toBe(2554032);
  });

  it("reads the GBIF key of a Wikidata item", () => {
    expect(findGbifKey("wikidata:Q16528286", new Map([["Q16528286", fungusItem]]))).toBe(2554032);
  });

  it("returns null for other identifiers", () => {
    expect(findGbifKey("ncbi:137744", new Map())).toBeNull();
  });
});

describe("contradictsGbif", () => {
  it("rejects an item that names another GBIF taxon", () => {
    expect(contradictsGbif(fungusItem, ["gbif:5"])).toBe(true);
  });

  it("accepts an item that names the matched GBIF taxon", () => {
    expect(contradictsGbif(fungusItem, ["gbif:2554032"])).toBe(false);
  });

  it("accepts an item without GBIF identifiers", () => {
    expect(contradictsGbif({ ...fungusItem, externalIds: [] }, ["gbif:5"])).toBe(false);
  });
});

describe("toGbifTaxon", () => {
  it("reads the key of a name match", () => {
    expect(toGbifTaxon({ usageKey: 8191482, matchType: "EXACT" })?.key).toBe(8191482);
  });

  it("reads the key of a lookup by key", () => {
    expect(toGbifTaxon({ key: 8191482 })?.key).toBe(8191482);
  });

  it("counts a lookup by key as an exact match", () => {
    expect(toGbifTaxon({ key: 8191482 })?.matchType).toBe("EXACT");
  });

  it("recognizes a synonym in a name match", () => {
    expect(toGbifTaxon({ usageKey: 1, status: "SYNONYM" })?.isSynonym).toBe(true);
  });

  it("recognizes a synonym in a lookup by key", () => {
    expect(toGbifTaxon({ key: 1, taxonomicStatus: "HOMOTYPIC_SYNONYM" })?.isSynonym).toBe(true);
  });

  it("reads the accepted key of a synonym", () => {
    expect(toGbifTaxon({ usageKey: 1, acceptedUsageKey: 2 })?.acceptedKey).toBe(2);
  });

  it("returns null when nothing matched", () => {
    expect(toGbifTaxon({ matchType: "NONE" })).toBeNull();
  });
});
