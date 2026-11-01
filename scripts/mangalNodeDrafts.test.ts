import { describe, expect, it } from "vitest";
import { listLinkedIdsByName, toMangalNodeDrafts } from "./mangalNodeDrafts.ts";
import type { MangalNode } from "./mangalRecords.ts";

const bee = {
  id: 1,
  networkId: 948,
  originalName: "Apis mellifera",
  taxonomy: { id: 1608, name: "Apis mellifera", rank: "species", gbif: 1341976, ncbi: 7460 },
} satisfies MangalNode;
const beeAgain = { ...bee, id: 2, networkId: 949 } satisfies MangalNode;
const unmatched = { id: 3, networkId: 948, originalName: "fungi", taxonomy: null };

describe("listLinkedIdsByName", () => {
  it("collects the taxa Mangal matched a name to across its nodes", () => {
    expect(listLinkedIdsByName([bee, beeAgain]).get("Apis mellifera")).toEqual([
      "gbif:1341976",
      "ncbi:7460",
      "gbif:1341976",
      "ncbi:7460",
    ]);
  });

  it("lists a name without a match under no identifiers", () => {
    expect(listLinkedIdsByName([unmatched]).get("fungi")).toEqual([]);
  });
});

describe("toMangalNodeDrafts", () => {
  const identities = new Map([
    [1, { id: "wikidata:Q30034", label: "Apis mellifera", rank: "species", qualityFlags: [] }],
    [3, { id: "mangal:fungi", label: "fungi", rank: null, qualityFlags: [] }],
  ]);

  it("drafts only the organisms that a connection touches", () => {
    const drafts = toMangalNodeDrafts(
      [bee, unmatched],
      identities,
      new Map(),
      new Set(["mangal:fungi"]),
    );
    expect(drafts.map(({ id }) => id)).toEqual(["mangal:fungi"]);
  });
});
