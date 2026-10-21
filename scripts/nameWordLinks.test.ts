import { describe, expect, it } from "vitest";
import { toNameWordImport } from "./nameWordLinks.ts";
import type { OrganismName } from "./vernacularNames.ts";
import type { WordForm } from "./wordForms.ts";

const checklist = {
  datasetId: "col",
  datasetCitation: "Catalogue of Life",
  studyCitation: null,
  studyUrl: "https://www.gbif.org/dataset/col",
  recordCount: null,
};
const labelsById = new Map([
  ["pinus", "Pinus"],
  ["redPine", "Pinus densiflora"],
]);

function makeName(overrides: Partial<OrganismName> = {}) {
  return {
    nodeId: "pinus",
    rank: "genus",
    language: "en",
    name: "pine",
    licence: "CC-BY-4.0",
    sources: [checklist],
    ...overrides,
  } satisfies OrganismName;
}

const pine = makeName();
const redPine = makeName({ nodeId: "redPine", rank: "species", name: "Japanese red pine" });

function listLinks(names: OrganismName[], knownForms: WordForm[] = [], containedLimit = 10) {
  const { connections } = toNameWordImport(names, knownForms, labelsById, containedLimit);
  return connections.map(
    ({ sourceNodeId, relation, targetNodeId }) => `${sourceNodeId} ${relation} ${targetNodeId}`,
  );
}

describe("toNameWordImport", () => {
  it("links an organism named by a word that another organism's name contains", () => {
    expect(listLinks([pine, redPine])).toContain("pinus named by word:en:pine");
  });

  it("links the organism whose name contains the word", () => {
    expect(listLinks([pine, redPine])).toContain("redPine name contains word:en:pine");
  });

  it("flags a contained word as a text match", () => {
    const { connections } = toNameWordImport([pine, redPine], [], labelsById, 10);
    const contained = connections.find(({ relation }) => relation === "name contains");
    expect(contained?.qualityFlags).toEqual(["text_match"]);
  });

  it("records the link as an attributed link through words", () => {
    const { connections } = toNameWordImport([pine, redPine], [], labelsById, 10);
    expect(connections[0]).toMatchObject({ kind: "shared_words_and_stories", basis: "attributed" });
  });

  it("makes no word of a name that no other organism shares", () => {
    expect(listLinks([redPine])).toEqual([]);
  });

  it("ignores a word shared only by names of the same organism", () => {
    expect(listLinks([pine, makeName({ name: "pine tree" })])).toEqual([]);
  });

  it("links a known word that one name contains", () => {
    const knownForms = [{ language: "en", form: "pine" }];
    expect(listLinks([redPine], knownForms)).toEqual(["redPine name contains word:en:pine"]);
  });

  it("does not match a word across languages", () => {
    const knownForms = [{ language: "fr", form: "pine" }];
    expect(listLinks([redPine], knownForms)).toEqual([]);
  });

  it("matches a Japanese genus name without its genus suffix", () => {
    const names = [
      makeName({ language: "ja", name: "マツ属" }),
      makeName({ nodeId: "redPine", rank: "species", language: "ja", name: "アカマツ" }),
    ];
    expect(listLinks(names)).toEqual([
      "pinus named by word:ja:マツ",
      "redPine name contains word:ja:マツ",
    ]);
  });

  it("keeps one link per organism and word", () => {
    const names = [
      pine,
      redPine,
      makeName({ nodeId: "redPine", rank: "species", name: "red pine" }),
    ];
    expect(listLinks(names)).toHaveLength(2);
  });

  it("keeps at most the limit of contained links per word", () => {
    const blackPine = makeName({ nodeId: "blackPine", rank: "species", name: "black pine" });
    expect(listLinks([pine, redPine, blackPine], [], 1)).toHaveLength(2);
  });

  it("adds each organism's names to its node", () => {
    const { nodes } = toNameWordImport([pine, redPine], [], labelsById, 10);
    expect(nodes.find(({ id }) => id === "redPine")?.names).toEqual([
      { language: "en", name: "Japanese red pine" },
    ]);
  });

  it("adds a node for each linked word", () => {
    const { nodes } = toNameWordImport([pine, redPine], [], labelsById, 10);
    expect(nodes.find(({ id }) => id === "word:en:pine")).toMatchObject({ kind: "word" });
  });
});
