import { describe, expect, it } from "vitest";
import type { FolkTaxon } from "./folkTaxa.ts";
import {
  type GbifKeyedMatch,
  linkFolkTaxon,
  type MatchedOrganism,
  toMatchedOrganism,
} from "./organismTaxa.ts";

const bees = {
  taxon: { kingdom: "Animalia", rank: "family", name: "Apidae" },
  woldMeaningIds: ["3-82"],
  motifTerms: ["bee"],
} satisfies FolkTaxon;

function makeMatch(overrides: Partial<GbifKeyedMatch> = {}) {
  return {
    matchType: "EXACT",
    rank: "SPECIES",
    usageKey: 1341976,
    kingdom: "Animalia",
    family: "Apidae",
    genus: "Apis",
    species: "Apis mellifera",
    ...overrides,
  } satisfies GbifKeyedMatch;
}

function makeOrganism(overrides: Partial<MatchedOrganism> = {}) {
  return {
    nodeId: "wikidata:Q30034",
    gbifKey: 1341976,
    rank: "species",
    lineage: { kingdom: "Animalia", family: "Apidae", genus: "Apis", species: "Apis mellifera" },
    connectionCount: 10,
    ...overrides,
  } satisfies MatchedOrganism;
}

describe("toMatchedOrganism", () => {
  it("reads the lineage of an exact match", () => {
    expect(toMatchedOrganism("a", makeMatch(), 0)?.lineage).toEqual({
      kingdom: "Animalia",
      family: "Apidae",
      genus: "Apis",
      species: "Apis mellifera",
    });
  });

  it("uses the accepted taxon's key for a synonym", () => {
    const match = makeMatch({ status: "SYNONYM", acceptedUsageKey: 5 });
    expect(toMatchedOrganism("a", match, 0)?.gbifKey).toBe(5);
  });

  it("gives the rank in lowercase", () => {
    expect(toMatchedOrganism("a", makeMatch(), 0)?.rank).toBe("species");
  });

  it("rejects a match to a higher rank", () => {
    expect(toMatchedOrganism("a", makeMatch({ matchType: "HIGHERRANK" }), 0)).toBeNull();
  });

  it("rejects a fuzzy match", () => {
    expect(toMatchedOrganism("a", makeMatch({ matchType: "FUZZY" }), 0)).toBeNull();
  });
});

describe("linkFolkTaxon", () => {
  describe("when an organism is the folk taxon itself", () => {
    const family = makeOrganism({ nodeId: "apidae", rank: "family", connectionCount: 0 });

    it("links only that organism", () => {
      const link = linkFolkTaxon(bees, [makeOrganism(), family], 3);
      expect(link.organisms.map(({ nodeId }) => nodeId)).toEqual(["apidae"]);
    });

    it("does not mark the link as pushed down", () => {
      expect(linkFolkTaxon(bees, [family], 3).isPushedDown).toBe(false);
    });
  });

  describe("when only organisms within the folk taxon are present", () => {
    const organisms = [
      makeOrganism({ nodeId: "a", connectionCount: 1 }),
      makeOrganism({ nodeId: "b", connectionCount: 5 }),
      makeOrganism({ nodeId: "c", connectionCount: 3 }),
    ];

    it("links the most connected ones, up to the limit", () => {
      const link = linkFolkTaxon(bees, organisms, 2);
      expect(link.organisms.map(({ nodeId }) => nodeId)).toEqual(["b", "c"]);
    });

    it("marks the link as pushed down", () => {
      expect(linkFolkTaxon(bees, organisms, 2).isPushedDown).toBe(true);
    });

    it("prefers a genus to its own species", () => {
      const genus = makeOrganism({ nodeId: "apis", rank: "genus", connectionCount: 0 });
      const link = linkFolkTaxon(bees, [...organisms, genus], 2);
      expect(link.organisms.map(({ nodeId }) => nodeId)).toEqual(["apis"]);
    });

    it("prefers a species to its own variety", () => {
      const variety = makeOrganism({ nodeId: "variety", rank: "variety", connectionCount: 9 });
      const link = linkFolkTaxon(bees, [variety, makeOrganism({ nodeId: "a" })], 2);
      expect(link.organisms.map(({ nodeId }) => nodeId)).toEqual(["a"]);
    });
  });

  it("ignores a namesake taxon in another kingdom", () => {
    const namesake = makeOrganism({ lineage: { kingdom: "Plantae", family: "Apidae" } });
    expect(linkFolkTaxon(bees, [namesake], 3).organisms).toEqual([]);
  });
});
