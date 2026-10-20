import { describe, expect, it } from "vitest";
import { listLinkedQids, parseTaxonLinks } from "./taxonLinks.ts";

describe("parseTaxonLinks", () => {
  it("reads a Wikidata item", () => {
    expect(parseTaxonLinks(["https://www.wikidata.org/wiki/Q20686564"])).toEqual([
      "wikidata:Q20686564",
    ]);
  });

  it("reads a GBIF taxon", () => {
    expect(parseTaxonLinks(["http://www.gbif.org/species/2554032"])).toEqual(["gbif:2554032"]);
  });

  it("reads an NCBI taxon", () => {
    expect(
      parseTaxonLinks(["https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=137744"]),
    ).toEqual(["ncbi:137744"]);
  });

  it("skips other links and missing ones", () => {
    expect(parseTaxonLinks(["http://eol.org/pages/18852", null])).toEqual([]);
  });
});

describe("listLinkedQids", () => {
  it("lists the Wikidata items among the identifiers", () => {
    expect(listLinkedQids(["gbif:1", "wikidata:Q2"])).toEqual(["Q2"]);
  });
});
