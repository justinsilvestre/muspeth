import { describe, expect, it } from "vitest";
import { sourceDisplayName } from "./sourceDisplayName";

describe("sourceDisplayName", () => {
  it("names a known source in full", () => {
    expect(sourceDisplayName("globi")).toBe("Global Biotic Interactions (GloBI)");
  });

  it.each([
    ["cleveland", "Cleveland Museum of Art Open Access"],
    ["eltontraits", "EltonTraits 1.0"],
    ["fungaltraits", "FungalTraits"],
    ["gbif_vernacular", "GBIF backbone vernacular names"],
    ["mangal", "Mangal"],
    ["met", "The Metropolitan Museum of Art Open Access"],
    ["sample", "Hand-entered sample"],
    ["thompson_motifs", "Thompson's Motif-Index"],
    ["wikidata", "Wikidata"],
    ["wikidata-depictions", "Wikidata depictions"],
    ["wold", "World Loanword Database"],
  ])("names the source %s as %s", (source, name) => {
    expect(sourceDisplayName(source)).toBe(name);
  });

  it("falls back to the stored identifier for an unknown source", () => {
    expect(sourceDisplayName("unknown")).toBe("unknown");
  });
});
