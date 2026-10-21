import { describe, expect, it } from "vitest";
import {
  buildCompoundCountsQuery,
  buildParentsQuery,
  buildQidsByGbifKeyQuery,
  buildQidsByTaxonNameQuery,
  buildSharedCompoundsQuery,
  buildTaxaQuery,
  buildUnsharedCompoundsQuery,
  listQids,
} from "./wikidataQueries.ts";

describe("listQids", () => {
  it("lists the Wikidata items among node identifiers", () => {
    expect(listQids(["wikidata:Q30034", "globi:Apis", "wikidata:Q1x"])).toEqual(["Q30034"]);
  });
});

describe("buildCompoundCountsQuery", () => {
  it("lists the organisms as values", () => {
    expect(buildCompoundCountsQuery(["Q1", "Q2"])).toContain("VALUES ?organism { wd:Q1 wd:Q2 }");
  });

  it("refuses text that is not an item identifier", () => {
    expect(() => buildCompoundCountsQuery(["Q1 } DROP"])).toThrow("Not a Wikidata item");
  });
});

describe("buildSharedCompoundsQuery", () => {
  it("compares the batch with all of the organisms", () => {
    expect(buildSharedCompoundsQuery(["Q1"], ["Q1", "Q2"])).toContain(
      "VALUES ?other { wd:Q1 wd:Q2 }",
    );
  });
});

describe("buildUnsharedCompoundsQuery", () => {
  it("limits the number of compounds", () => {
    expect(buildUnsharedCompoundsQuery("Q1", ["Q1", "Q2"], 5)).toContain("LIMIT 5");
  });
});

describe("buildParentsQuery", () => {
  it("asks for the parent of each taxon", () => {
    expect(buildParentsQuery(["Q1", "Q2"])).toContain("VALUES ?taxon { wd:Q1 wd:Q2 }");
  });
});

describe("buildTaxaQuery", () => {
  it("keeps labels in the kept languages", () => {
    expect(buildTaxaQuery(["Q1"])).toContain('FILTER(?language IN ("en", "ja"');
  });
});

describe("buildQidsByTaxonNameQuery", () => {
  it("quotes the names as values", () => {
    expect(buildQidsByTaxonNameQuery(['Apis "mellifera"'])).toContain(
      'VALUES ?taxonName { "Apis \\"mellifera\\"" }',
    );
  });
});

describe("buildQidsByGbifKeyQuery", () => {
  it("lists the keys as string values", () => {
    expect(buildQidsByGbifKeyQuery([1, 2])).toContain('VALUES ?gbif { "1" "2" }');
  });
});
