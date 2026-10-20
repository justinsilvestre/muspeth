import { describe, expect, it } from "vitest";
import type { GbifTaxon } from "./gbifTaxon.ts";
import { findTraitName, listGenusNames, listSpeciesNames } from "./traitNameMatches.ts";

function makeTaxon(overrides: Partial<GbifTaxon> = {}) {
  return {
    key: 1,
    acceptedKey: null,
    canonicalName: null,
    rank: "SPECIES",
    isSynonym: false,
    matchType: "EXACT",
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    genus: null,
    species: null,
    ...overrides,
  } satisfies GbifTaxon;
}

function findSpecies(label: string, taxon: GbifTaxon, listed: string[], synonyms?: string[]) {
  return findTraitName(listSpeciesNames(label, taxon, synonyms), new Set(listed));
}

function findGenus(label: string, taxon: GbifTaxon, listed: string[]) {
  return findTraitName(listGenusNames(label, taxon), new Set(listed));
}

describe("findTraitName", () => {
  describe("for a species-level database", () => {
    it("matches the organism's own name without doubt", () => {
      expect(findSpecies("Struthio camelus", makeTaxon(), ["Struthio camelus"])).toEqual({
        name: "Struthio camelus",
        qualityFlags: [],
      });
    });

    it("flags a match through GBIF's correction of a misspelt name", () => {
      const taxon = makeTaxon({ canonicalName: "Struthio camelus", matchType: "FUZZY" });
      expect(findSpecies("Struthio camelu", taxon, ["Struthio camelus"])?.qualityFlags).toEqual([
        "fuzzy_name_match",
      ]);
    });

    it("flags a match through the accepted name of a synonym", () => {
      const taxon = makeTaxon({ isSynonym: true, species: "Cyanistes caeruleus" });
      expect(findSpecies("Parus caeruleus", taxon, ["Cyanistes caeruleus"])?.qualityFlags).toEqual([
        "trait_name_synonym",
      ]);
    });

    it("flags a match through a synonym of the organism's name", () => {
      const listed = ["Parus caeruleus"];
      const match = findSpecies("Cyanistes caeruleus", makeTaxon(), listed, ["Parus caeruleus"]);
      expect(match?.qualityFlags).toEqual(["trait_name_synonym"]);
    });

    it("returns null when no name is listed", () => {
      expect(findSpecies("Homo sapiens", makeTaxon(), ["Pan troglodytes"])).toBeNull();
    });
  });

  describe("for a genus-level database", () => {
    const fungus = makeTaxon({ kingdom: "Fungi", genus: "Tricholoma" });

    it("matches a genus node without doubt", () => {
      expect(findGenus("Tricholoma", fungus, ["Tricholoma"])?.qualityFlags).toEqual([]);
    });

    it("marks a species node's match as derived from the genus", () => {
      expect(findGenus("Tricholoma matsutake", fungus, ["Tricholoma"])?.qualityFlags).toEqual([
        "derived_from_coarser_level",
      ]);
    });

    it("flags a match through the accepted genus", () => {
      const taxon = makeTaxon({ kingdom: "Fungi", genus: "Armillaria" });
      expect(findGenus("Armillariella mellea", taxon, ["Armillaria"])?.qualityFlags).toEqual([
        "derived_from_coarser_level",
        "trait_name_synonym",
      ]);
    });
  });
});
