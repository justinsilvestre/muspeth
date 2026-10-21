import { describe, expect, it } from "vitest";
import { type GbifMatch, toTaxonomySql, toTaxonPlacement, toTaxonRows } from "./gbifTaxonomy.ts";

const pineMatch = {
  matchType: "EXACT",
  status: "ACCEPTED",
  kingdom: "Plantae",
  kingdomKey: 6,
  genus: "Pinus",
  genusKey: 2684241,
  species: "Pinus densiflora",
  speciesKey: 5285104,
} satisfies GbifMatch;

describe("toTaxonRows", () => {
  it("parents each taxon on the nearest higher rank present", () => {
    const [, genus] = toTaxonRows(pineMatch);
    expect(genus).toMatchObject({ id: "gbif:2684241", parentId: "gbif:6" });
  });

  it("gives the kingdom no parent", () => {
    const [kingdom] = toTaxonRows(pineMatch);
    expect(kingdom?.parentId).toBeNull();
  });

  it("returns nothing when GBIF found no match", () => {
    expect(toTaxonRows({ matchType: "NONE" })).toEqual([]);
  });
});

describe("toTaxonPlacement", () => {
  it("places the organism on the lowest matched taxon", () => {
    expect(toTaxonPlacement("pine", pineMatch)?.taxonId).toBe("gbif:5285104");
  });

  it("flags a fuzzy name match", () => {
    const placement = toTaxonPlacement("pine", { ...pineMatch, matchType: "FUZZY" });
    expect(placement?.qualityFlags).toEqual(["fuzzy_name_match"]);
  });

  it("flags a name that GBIF treats as a synonym", () => {
    const placement = toTaxonPlacement("pine", { ...pineMatch, status: "SYNONYM" });
    expect(placement?.qualityFlags).toEqual(["synonym_name"]);
  });

  it("flags a taxon that GBIF doubts", () => {
    const placement = toTaxonPlacement("pine", { ...pineMatch, status: "DOUBTFUL" });
    expect(placement?.qualityFlags).toEqual(["doubtful_usage"]);
  });

  it("flags a match chosen with a hint from GloBI's lineage", () => {
    const placement = toTaxonPlacement("pine", { ...pineMatch, hintedBy: "globi_lineage" });
    expect(placement?.qualityFlags).toEqual(["globi_lineage_hint"]);
  });

  it("returns null when GBIF found no match", () => {
    expect(toTaxonPlacement("pine", { matchType: "NONE" })).toBeNull();
  });
});

describe("toTaxonomySql", () => {
  it("escapes quotes in names", () => {
    const sql = toTaxonomySql(toTaxonRows(pineMatch), [
      { nodeId: "o'pine", taxonId: "gbif:1", qualityFlags: [] },
    ]);
    expect(sql).toContain("'o''pine'");
  });

  it("writes each taxon once, however many organisms share it", () => {
    const sql = toTaxonomySql([...toTaxonRows(pineMatch), ...toTaxonRows(pineMatch)], []);
    expect(sql.match(/'gbif:6', NULL/g)).toHaveLength(1);
  });
});
