import { describe, expect, it } from "vitest";
import {
  chooseAlternative,
  type GlobiLineage,
  readGlobiLineage,
  toAncestorMatch,
} from "./gbifLineageHints.ts";
import type { GbifMatch } from "./gbifTaxonomy.ts";

const ncbiPinePath = {
  names: "root | cellular organisms | Eukaryota | Viridiplantae | Pinales | Pinaceae | Pinus",
  ranks: "|  | superkingdom | kingdom | order | family | genus",
};
const plantPine = {
  matchType: "EXACT",
  rank: "GENUS",
  confidence: 99,
  kingdom: "Plantae",
  order: "Pinales",
  family: "Pinaceae",
  genus: "Pinus",
} satisfies GbifMatch;
const molluscPine = {
  matchType: "EXACT",
  rank: "GENUS",
  confidence: 98,
  kingdom: "Animalia",
  phylum: "Mollusca",
  genus: "Pinus",
} satisfies GbifMatch;
const ambiguousPine = { matchType: "NONE", alternatives: [plantPine, molluscPine] };
const pineLineage = {
  ancestorNames: ["Pinaceae", "Pinales", "Plantae"],
  rank: "genus",
} satisfies GlobiLineage;

describe("readGlobiLineage", () => {
  it("lists the ancestors nearest first", () => {
    const { ancestorNames } = readGlobiLineage("Pinus", [ncbiPinePath]);
    expect(ancestorNames.slice(0, 2)).toEqual(["Pinaceae", "Pinales"]);
  });

  it("renames NCBI kingdoms to their GBIF names", () => {
    const { ancestorNames } = readGlobiLineage("Pinus", [ncbiPinePath]);
    expect(ancestorNames).toContain("Plantae");
  });

  it("reads the rank of the named taxon", () => {
    expect(readGlobiLineage("Pinus", [ncbiPinePath]).rank).toBe("genus");
  });

  it("lists the ancestors of the most common path first", () => {
    const otherPath = { names: "Plantae | Coniferae | Pinus", ranks: null };
    const { ancestorNames } = readGlobiLineage("Pinus", [otherPath, ncbiPinePath, ncbiPinePath]);
    expect(ancestorNames[0]).toBe("Pinaceae");
  });

  it("lists each ancestor once", () => {
    const otherPath = { names: "Plantae | Pinaceae | Pinus", ranks: null };
    const { ancestorNames } = readGlobiLineage("Pinus", [ncbiPinePath, otherPath]);
    expect(ancestorNames.filter((name) => name === "Pinaceae")).toHaveLength(1);
  });

  it("finds no rank when GloBI gives none", () => {
    expect(readGlobiLineage("Pinus", [{ names: "Pinus", ranks: null }]).rank).toBeNull();
  });
});

describe("chooseAlternative", () => {
  it("picks the alternative whose lineage shares names with GloBI's", () => {
    expect(chooseAlternative(ambiguousPine, pineLineage)?.kingdom).toBe("Plantae");
  });

  it("marks the chosen match as hinted by GloBI's lineage", () => {
    expect(chooseAlternative(ambiguousPine, pineLineage)?.hintedBy).toBe("globi_lineage");
  });

  it("picks the alternative of the rank GloBI gives", () => {
    const bacteriaKingdom = { matchType: "EXACT", rank: "KINGDOM", kingdom: "Bacteria" };
    const insectGenus = { matchType: "EXACT", rank: "GENUS", kingdom: "Animalia" };
    const match = { matchType: "NONE", alternatives: [insectGenus, bacteriaKingdom] };
    const lineage = { ancestorNames: [], rank: "kingdom" };
    expect(chooseAlternative(match, lineage)?.rank).toBe("KINGDOM");
  });

  it("picks the most confident of equally fitting alternatives in one kingdom", () => {
    const synonym = { ...plantPine, confidence: 98, status: "SYNONYM" };
    const match = { matchType: "NONE", alternatives: [synonym, plantPine] };
    expect(chooseAlternative(match, pineLineage)?.confidence).toBe(99);
  });

  it("chooses nothing when equally fitting alternatives lie in different kingdoms", () => {
    const lineage = { ancestorNames: [], rank: "genus" };
    expect(chooseAlternative(ambiguousPine, lineage)).toBeNull();
  });

  it("chooses nothing when no alternative fits GloBI's lineage", () => {
    const lineage = { ancestorNames: ["Fungi"], rank: null };
    expect(chooseAlternative(ambiguousPine, lineage)).toBeNull();
  });

  it("ignores fuzzy alternatives", () => {
    const match = { matchType: "NONE", alternatives: [{ ...plantPine, matchType: "FUZZY" }] };
    expect(chooseAlternative(match, pineLineage)).toBeNull();
  });
});

describe("toAncestorMatch", () => {
  it("marks the match as a higher-rank match", () => {
    expect(toAncestorMatch(plantPine).matchType).toBe("HIGHERRANK");
  });

  it("marks the match as hinted by GloBI's lineage", () => {
    expect(toAncestorMatch(plantPine).hintedBy).toBe("globi_lineage");
  });
});
