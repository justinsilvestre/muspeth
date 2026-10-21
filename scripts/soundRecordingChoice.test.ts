import { describe, expect, it } from "vitest";
import type { GbifTaxon } from "./gbifTaxon.ts";
import { chooseRecordings, toMatchFlags, toRecordedTaxonKey } from "./soundRecordingChoice.ts";
import type { GbifSoundOccurrence } from "./soundRecordings.ts";

function makeOccurrence(key: number, recordist: string, isLocated = true) {
  return {
    key,
    datasetKey: "xeno-canto",
    species: "Horornis diphone",
    ...(isLocated ? { decimalLatitude: 35, decimalLongitude: 138 } : {}),
    media: [
      {
        type: "Sound",
        identifier: `https://example.org/${key}.mp3`,
        license: "CC_BY_NC_SA_4_0",
        rightsHolder: recordist,
      },
    ],
  } satisfies GbifSoundOccurrence;
}

function chooseKeys(occurrences: GbifSoundOccurrence[], count: number) {
  return chooseRecordings(occurrences, count).map(({ node }) => node.id);
}

describe("chooseRecordings", () => {
  it("keeps at most the number asked for", () => {
    const occurrences = [makeOccurrence(1, "A"), makeOccurrence(2, "B"), makeOccurrence(3, "C")];
    expect(chooseKeys(occurrences, 2)).toEqual(["gbif-occurrence:1", "gbif-occurrence:2"]);
  });

  it("takes each recordist once", () => {
    const occurrences = [makeOccurrence(1, "A"), makeOccurrence(2, "A"), makeOccurrence(3, "B")];
    expect(chooseKeys(occurrences, 2)).toEqual(["gbif-occurrence:1", "gbif-occurrence:3"]);
  });

  it("prefers recordings whose place is known", () => {
    const occurrences = [makeOccurrence(1, "A", false), makeOccurrence(2, "B")];
    expect(chooseKeys(occurrences, 1)).toEqual(["gbif-occurrence:2"]);
  });
});

function makeTaxon(overrides: Partial<GbifTaxon> = {}) {
  return {
    key: 2,
    acceptedKey: null,
    canonicalName: "Horornis diphone",
    rank: "SPECIES",
    isSynonym: false,
    matchType: "EXACT",
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    genus: "Horornis",
    species: "Horornis diphone",
    ...overrides,
  } satisfies GbifTaxon;
}

describe("toRecordedTaxonKey", () => {
  it("gives a species' own key", () => {
    expect(toRecordedTaxonKey(makeTaxon())).toBe(2);
  });

  it("gives the accepted key of a synonym", () => {
    expect(toRecordedTaxonKey(makeTaxon({ acceptedKey: 3, isSynonym: true }))).toBe(3);
  });

  it("gives nothing for a genus", () => {
    expect(toRecordedTaxonKey(makeTaxon({ rank: "GENUS" }))).toBeNull();
  });

  it("gives nothing without a match", () => {
    expect(toRecordedTaxonKey(null)).toBeNull();
  });
});

describe("toMatchFlags", () => {
  it("flags a fuzzy match of a synonym", () => {
    expect(toMatchFlags(makeTaxon({ matchType: "FUZZY", isSynonym: true }))).toEqual([
      "fuzzy_name_match",
      "synonym_name",
    ]);
  });
});
