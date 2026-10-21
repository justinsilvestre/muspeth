import { describe, expect, it } from "vitest";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import {
  type GlobiConnectionDraft,
  mergeConnections,
  toConnectionDraft,
} from "./globiConnections.ts";
import type { GlobiRecord } from "./globiRecords.ts";

const study = {
  datasetId: "one",
  datasetCitation: "One.",
  studyCitation: "A study.",
  studyUrl: null,
  recordCount: 1,
};

const pine = { name: "Pinus densiflora", externalId: "EOL:1", rank: "species", commonNames: null };
const pines = { name: "Pinus", externalId: "NCBI:3337", rank: "genus", commonNames: null };
const matsutake = {
  name: "Tricholoma matsutake",
  externalId: "NCBI:2",
  rank: "species",
  commonNames: null,
};
const identities = new Map<string, { id: string; qualityFlags: QualityFlag[] }>([
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
    datasetCitation: "GlobalFungi.",
    studyCitation: "Park 2020.",
    studyUrl: "https://doi.org/10.3389/fmicb.2020.572706",
    ...overrides,
  } satisfies GlobiRecord;
}

function makeDraft(overrides: Partial<GlobiConnectionDraft> = {}) {
  return {
    sourceNodeId: "a",
    targetNodeId: "b",
    kind: "interaction",
    relation: "eats",
    basis: "observed",
    taxonomicLevel: "species",
    licence: "CC0-1.0",
    sources: [study],
    qualityFlags: [],
    ...overrides,
  } satisfies GlobiConnectionDraft;
}

describe("toConnectionDraft", () => {
  it("links the identified nodes", () => {
    expect(toConnectionDraft(makeRecord(), identities)).toMatchObject({
      sourceNodeId: "wikidata:Q509308",
      targetNodeId: "wikidata:Q1044186",
    });
  });

  it("records an interaction observed by GloBI, under its CC0 licence", () => {
    expect(toConnectionDraft(makeRecord(), identities)).toMatchObject({
      kind: "interaction",
      basis: "observed",
      licence: "CC0-1.0",
    });
  });

  it("records the coarser of the two taxonomic levels", () => {
    const draft = toConnectionDraft(makeRecord({ object: pines }), identities);
    expect(draft.taxonomicLevel).toBe("genus");
  });

  it("credits the record's study and dataset", () => {
    expect(toConnectionDraft(makeRecord(), identities).sources).toEqual([
      {
        datasetId: "globalbioticinteractions/globalfungi",
        datasetCitation: "GlobalFungi.",
        studyCitation: "Park 2020.",
        studyUrl: "https://doi.org/10.3389/fmicb.2020.572706",
        recordCount: 1,
      },
    ]);
  });

  it("carries over the identification flags of either organism", () => {
    expect(toConnectionDraft(makeRecord(), identities).qualityFlags).toEqual([
      "ambiguous_wikidata_id",
    ]);
  });
});

describe("mergeConnections", () => {
  it("merges repeated records of one interaction", () => {
    expect(mergeConnections([makeDraft(), makeDraft()])).toHaveLength(1);
  });

  it("counts the records of a study that reports the interaction more than once", () => {
    const [merged] = mergeConnections([makeDraft(), makeDraft()]);
    expect(merged?.sources).toEqual([{ ...study, recordCount: 2 }]);
  });

  it("keeps each distinct study", () => {
    const other = { ...study, studyCitation: "Another study." };
    const [merged] = mergeConnections([makeDraft(), makeDraft({ sources: [other] })]);
    expect(merged?.sources).toEqual([study, other]);
  });

  it("keeps one study reported in two datasets apart", () => {
    const other = { ...study, datasetId: "two" };
    const [merged] = mergeConnections([makeDraft(), makeDraft({ sources: [other] })]);
    expect(merged?.sources).toHaveLength(2);
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

  it("keeps the coarser taxonomic level", () => {
    const [merged] = mergeConnections([makeDraft(), makeDraft({ taxonomicLevel: "family" })]);
    expect(merged?.taxonomicLevel).toBe("family");
  });

  it("drops a link from an organism to itself", () => {
    expect(mergeConnections([makeDraft({ targetNodeId: "a" })])).toEqual([]);
  });
});
