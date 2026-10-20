import { describe, expect, it } from "vitest";
import {
  identifyMangalNode,
  isPlaceholderName,
  listMangalNodeNames,
  readWebOfLifeId,
  toLookupName,
} from "./mangalOrganisms.ts";
import type { MangalNode } from "./mangalRecords.ts";
import type { WikidataTaxon } from "./organismIdentity.ts";

const bee = {
  id: 1,
  networkId: 948,
  originalName: "Apis mellifera",
  taxonomy: { id: 1608, name: "Apis mellifera", rank: "species", gbif: 1341976, ncbi: 7460 },
} satisfies MangalNode;
const morphospecies = {
  id: 2,
  networkId: 948,
  originalName: "Cheilosia sp3 M_PL_056",
  taxonomy: { id: 5, name: "Cheilosia", rank: "genus", gbif: 1, ncbi: null },
} satisfies MangalNode;
const typo = { id: 3, networkId: 948, originalName: "Anaspis funagata", taxonomy: null };
const beeEntity = {
  qid: "Q30034",
  taxonNames: ["Apis mellifera"],
  labels: [{ language: "en", name: "western honey bee" }],
  externalIds: ["gbif:1341976"],
} satisfies WikidataTaxon;
const noExisting = new Map<string, string>();

describe("isPlaceholderName", () => {
  it.each([
    "Cheilosia sp3",
    "Potentilla sp.",
    "Lasioglossum sp.K1",
    "Andrena spp.",
    "Unidentified sp22",
    "unknown sp.",
    "Species 12",
    "Diptera 4",
    "morphospecies A",
  ])("treats %s as a placeholder", (name) => {
    expect(isPlaceholderName(name)).toBe(true);
  });

  it.each(["Apis mellifera", "Senecio spinosus", "Bombus", "Rabbit"])(
    "treats %s as a name",
    (name) => {
      expect(isPlaceholderName(name)).toBe(false);
    },
  );
});

describe("readWebOfLifeId", () => {
  it("reads the Web of Life network that a name was copied from", () => {
    expect(readWebOfLifeId("Cheilosia sp3 M_PL_056")).toBe("M_PL_056");
  });

  it("returns null for a plain name", () => {
    expect(readWebOfLifeId("Apis mellifera")).toBeNull();
  });
});

describe("toLookupName", () => {
  it("looks up a matched node by its taxon's name", () => {
    expect(toLookupName({ ...bee, originalName: "honey bee" })).toBe("Apis mellifera");
  });

  it("looks up an unmatched node by its original name", () => {
    expect(toLookupName(typo)).toBe("Anaspis funagata");
  });

  it("does not look up a placeholder", () => {
    expect(toLookupName(morphospecies)).toBeNull();
  });
});

describe("identifyMangalNode", () => {
  it("reuses the node that already bears the taxon's name", () => {
    const existing = new Map([["Apis mellifera", "wikidata:Q30034"]]);
    expect(identifyMangalNode(bee, null, existing).id).toBe("wikidata:Q30034");
  });

  it("uses the chosen Wikidata item", () => {
    const choice = { taxon: beeEntity, isAmbiguous: false };
    expect(identifyMangalNode(bee, choice, noExisting).id).toBe("wikidata:Q30034");
  });

  it("flags an ambiguous Wikidata item", () => {
    const choice = { taxon: beeEntity, isAmbiguous: true };
    expect(identifyMangalNode(bee, choice, noExisting).qualityFlags).toEqual([
      "ambiguous_wikidata_id",
    ]);
  });

  it("falls back to the taxon's GBIF identifier", () => {
    expect(identifyMangalNode(bee, null, noExisting).id).toBe("gbif:1341976");
  });

  it("falls back to the taxon's NCBI identifier", () => {
    const taxonomy = { ...bee.taxonomy, gbif: null };
    expect(identifyMangalNode({ ...bee, taxonomy }, null, noExisting).id).toBe("ncbi:7460");
  });

  it("keeps an unmatched name under its own identifier", () => {
    expect(identifyMangalNode(typo, null, noExisting).id).toBe("mangal:Anaspis funagata");
  });

  it("flags an unmatched name", () => {
    expect(identifyMangalNode(typo, null, noExisting).qualityFlags).toEqual(["unmatched_name"]);
  });

  it("gives a placeholder a node of its own within its network", () => {
    expect(identifyMangalNode(morphospecies, null, noExisting).id).toBe("mangal:948/Cheilosia sp3");
  });

  it("flags a placeholder", () => {
    expect(identifyMangalNode(morphospecies, null, noExisting).qualityFlags).toEqual([
      "placeholder_species",
    ]);
  });

  it("gives a placeholder the rank of the taxon Mangal matched it to", () => {
    expect(identifyMangalNode(morphospecies, null, noExisting).rank).toBe("genus");
  });

  it("labels a placeholder without its Web of Life suffix", () => {
    expect(identifyMangalNode(morphospecies, null, noExisting).label).toBe("Cheilosia sp3");
  });
});

describe("listMangalNodeNames", () => {
  it("lists the Wikidata item's labels", () => {
    const choice = { taxon: beeEntity, isAmbiguous: false };
    expect(listMangalNodeNames("Apis mellifera", choice)).toEqual([
      { language: "en", name: "western honey bee" },
    ]);
  });

  it("leaves out a label that repeats the scientific name", () => {
    const taxon = { ...beeEntity, labels: [{ language: "fr", name: "Apis mellifera" }] };
    expect(listMangalNodeNames("Apis mellifera", { taxon, isAmbiguous: false })).toEqual([]);
  });
});
