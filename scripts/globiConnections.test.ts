import { describe, expect, it } from "vitest";
import { type ConnectionDraft, mergeConnections, toConnectionDraft } from "./globiConnections.ts";
import type { GlobiRecord } from "./globiRecords.ts";

const pine = { name: "Pinus densiflora", externalId: "EOL:1", rank: "species", commonNames: null };
const pines = { name: "Pinus", externalId: "NCBI:3337", rank: "genus", commonNames: null };
const matsutake = {
  name: "Tricholoma matsutake",
  externalId: "NCBI:2",
  rank: "species",
  commonNames: null,
};
const identities = new Map([
  [pine.name, { id: "wikidata:Q1044186", qualityFlags: [] }],
  [pines.name, { id: "wikidata:Q12024", qualityFlags: [] }],
  [matsutake.name, { id: "wikidata:Q509308", qualityFlags: ["ambiguous_wikidata_id"] }],
]);

function makeRecord(overrides: Partial<GlobiRecord> = {}) {
  return {
    subject: matsutake,
    relation: "symbiontOf",
    object: pine,
    datasetId: "globalbioticinteractions/globalfungi",
    citation: "GlobalFungi.",
    ...overrides,
  } satisfies GlobiRecord;
}

function makeDraft(overrides: Partial<ConnectionDraft> = {}) {
  return {
    sourceNodeId: "a",
    targetNodeId: "b",
    relation: "eats",
    taxonomicLevel: "species",
    citations: ["One."],
    qualityFlags: [],
    ...overrides,
  } satisfies ConnectionDraft;
}

describe("toConnectionDraft", () => {
  it("links the identified nodes", () => {
    expect(toConnectionDraft(makeRecord(), identities)).toMatchObject({
      sourceNodeId: "wikidata:Q509308",
      targetNodeId: "wikidata:Q1044186",
    });
  });

  it("records the coarser of the two taxonomic levels", () => {
    const draft = toConnectionDraft(makeRecord({ object: pines }), identities);
    expect(draft.taxonomicLevel).toBe("genus");
  });

  it("carries over the identification flags of either organism", () => {
    expect(toConnectionDraft(makeRecord(), identities).qualityFlags).toEqual([
      "ambiguous_wikidata_id",
    ]);
  });

  it("flags records that a language model generated", () => {
    const record = makeRecord({ datasetId: "fkeck/gpt_interactions" });
    expect(toConnectionDraft(record, identities).qualityFlags).toContain(
      "generated_by_language_model",
    );
  });
});

describe("mergeConnections", () => {
  it("merges repeated records of one interaction", () => {
    expect(mergeConnections([makeDraft(), makeDraft()])).toHaveLength(1);
  });

  it("keeps each distinct citation", () => {
    const [merged] = mergeConnections([makeDraft(), makeDraft({ citations: ["Two."] })]);
    expect(merged?.citations).toEqual(["One.", "Two."]);
  });

  it("merges a symmetric relation recorded in both directions", () => {
    const drafts = [
      makeDraft({ relation: "mutualistOf" }),
      makeDraft({ relation: "mutualistOf", sourceNodeId: "b", targetNodeId: "a" }),
    ];
    expect(mergeConnections(drafts)).toHaveLength(1);
  });

  it("keeps both directions of a directed relation", () => {
    const drafts = [makeDraft(), makeDraft({ sourceNodeId: "b", targetNodeId: "a" })];
    expect(mergeConnections(drafts)).toHaveLength(2);
  });

  it("flags a merged interaction as generated only when every record was generated", () => {
    const generated = makeDraft({ qualityFlags: ["generated_by_language_model"] });
    const [merged] = mergeConnections([generated, makeDraft()]);
    expect(merged?.qualityFlags).toEqual([]);
  });

  it("keeps the coarser taxonomic level", () => {
    const [merged] = mergeConnections([makeDraft(), makeDraft({ taxonomicLevel: "family" })]);
    expect(merged?.taxonomicLevel).toBe("family");
  });

  it("drops a link from an organism to itself", () => {
    expect(mergeConnections([makeDraft({ targetNodeId: "a" })])).toEqual([]);
  });
});
