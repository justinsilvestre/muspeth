import { describe, expect, it } from "vitest";
import { contradictsGbif, findGbifKey, toExactMatch, toGbifTaxon } from "./gbifTaxon.ts";

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

describe("toExactMatch", () => {
  it("reads the key of a lookup by key as the matched key", () => {
    expect(toExactMatch({ key: 8191482 }).usageKey).toBe(8191482);
  });

  it("counts a lookup by key as an exact match", () => {
    expect(toExactMatch({ key: 8191482 }).matchType).toBe("EXACT");
  });

  it("reads the accepted key of a synonym", () => {
    expect(toExactMatch({ key: 1, acceptedKey: 2 }).acceptedUsageKey).toBe(2);
  });

  it("calls any kind of synonym a synonym, as a name match does", () => {
    expect(toExactMatch({ key: 1, taxonomicStatus: "HOMOTYPIC_SYNONYM" }).status).toBe("SYNONYM");
  });

  it("keeps any other status", () => {
    expect(toExactMatch({ key: 1, taxonomicStatus: "DOUBTFUL" }).status).toBe("DOUBTFUL");
  });

  it("keeps the lineage", () => {
    expect(toExactMatch({ key: 1, genus: "Pinus", genusKey: 2684241 })).toMatchObject({
      genus: "Pinus",
      genusKey: 2684241,
    });
  });
});

describe("toGbifTaxon", () => {
  it("reads the key of a name match", () => {
    expect(toGbifTaxon({ usageKey: 8191482, matchType: "EXACT" })?.key).toBe(8191482);
  });

  it("recognizes a synonym", () => {
    expect(toGbifTaxon({ usageKey: 1, matchType: "EXACT", status: "SYNONYM" })?.isSynonym).toBe(
      true,
    );
  });

  it("reads the accepted key of a synonym", () => {
    expect(toGbifTaxon({ usageKey: 1, matchType: "EXACT", acceptedUsageKey: 2 })?.acceptedKey).toBe(
      2,
    );
  });

  it("returns null when nothing matched", () => {
    expect(toGbifTaxon({ matchType: "NONE" })).toBeNull();
  });
});
