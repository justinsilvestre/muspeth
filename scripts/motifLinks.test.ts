import { describe, expect, it } from "vitest";
import type { FolkTaxon } from "./folkTaxa.ts";
import { mentionsAnyTerm, toMotifImport } from "./motifLinks.ts";
import type { FolkTaxonLink } from "./organismTaxa.ts";

const honeyBee = {
  nodeId: "honeyBee",
  gbifKey: 1341976,
  rank: "species",
  lineage: { kingdom: "Animalia", family: "Apidae" },
  connectionCount: 3,
};

function makeLink(motifTerms: string[], overrides: Partial<FolkTaxonLink> = {}) {
  const folkTaxon = {
    taxon: { kingdom: "Animalia", rank: "family", name: "Apidae" },
    woldMeaningIds: [],
    motifTerms,
  } satisfies FolkTaxon;
  return {
    folkTaxon,
    organisms: [honeyBee],
    isPushedDown: true,
    ...overrides,
  } satisfies FolkTaxonLink;
}

function makeRow(code: string, text: string) {
  return { code, "[sorting field]": code, MOTIF: `${code}. ${text}` };
}

const beeLink = makeLink(["bee", "bees"]);

describe("toMotifImport", () => {
  it("links the folk taxon's organisms to the motifs that name it", () => {
    const { connections } = toMotifImport(
      [makeRow("A2012.0.1", "Creation of honey-bees: transformed man.")],
      [beeLink],
      10,
    );
    expect(connections[0]).toMatchObject({
      sourceNodeId: "honeyBee",
      targetNodeId: "tmi:A2012.0.1",
      relation: "appears in motif",
    });
  });

  it("flags a pushed-down link as a text match derived from a coarser level", () => {
    const { connections } = toMotifImport([makeRow("B1", "Bee as helper.")], [beeLink], 10);
    expect(connections[0]?.qualityFlags).toEqual(["text_match", "derived_from_coarser_level"]);
  });

  it("labels the motif node with its code and text", () => {
    const { nodes } = toMotifImport([makeRow("B1", "Bee as helper.")], [beeLink], 10);
    expect(nodes[0]?.label).toBe("B1. Bee as helper.");
  });

  it("does not read the editor's notes as part of the motif", () => {
    const rows = [makeRow("B489.1", "Helpful spider. [Note: In folk thought, a bee.]")];
    expect(toMotifImport(rows, [beeLink], 10).connections).toEqual([]);
  });

  it("prefers motifs from chapters A and B", () => {
    const rows = [makeRow("D1", "Magic bee."), makeRow("B1", "Bee as helper.")];
    const { nodes } = toMotifImport(rows, [beeLink], 1);
    expect(nodes.map(({ id }) => id)).toEqual(["tmi:B1"]);
  });

  it("prefers motifs that name several folk taxa", () => {
    const rows = [makeRow("A1", "Bee as helper."), makeRow("J1", "Bee and ant dispute.")];
    const antLink = makeLink(["ant"], { organisms: [{ ...honeyBee, nodeId: "ant" }] });
    const { nodes } = toMotifImport(rows, [beeLink, antLink], 1);
    expect(nodes.map(({ id }) => id)).toEqual(["tmi:J1", "tmi:J1"]);
  });

  it("keeps one link per organism and motif when two folk taxa lead to it", () => {
    const insectLink = makeLink(["insects"]);
    const rows = [makeRow("A1", "Bees and other insects.")];
    expect(toMotifImport(rows, [beeLink, insectLink], 10).connections).toHaveLength(1);
  });
});

describe("mentionsAnyTerm", () => {
  it("finds a term between hyphens", () => {
    expect(mentionsAnyTerm("Creation of honey-bees.", ["bees"])).toBe(true);
  });

  it("finds a phrase of several words", () => {
    expect(mentionsAnyTerm("Origin of the palm-tree.", ["palm tree"])).toBe(true);
  });

  it("does not find a term inside a longer word", () => {
    expect(mentionsAnyTerm("Pineapple from heaven.", ["pine"])).toBe(false);
  });

  it("finds a capitalized term at the start of a sentence", () => {
    expect(mentionsAnyTerm("Ram with golden fleece.", ["ram"])).toBe(true);
  });

  it("ignores a capitalized term within a sentence, as a proper name", () => {
    expect(mentionsAnyTerm("Plum tree blessed by Ram.", ["ram"])).toBe(false);
  });

  it("ignores phrases that use a term in another sense", () => {
    expect(mentionsAnyTerm("Fairy child pines away.", ["pines"])).toBe(false);
  });
});
