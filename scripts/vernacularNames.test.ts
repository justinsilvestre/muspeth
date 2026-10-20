import { describe, expect, it } from "vitest";
import {
  type Checklist,
  choosePermissiveLicence,
  type GbifVernacularName,
  selectVernacularNames,
  toOrganismNames,
  toSpdxLicence,
} from "./vernacularNames.ts";

const limits = { perLanguage: 2, total: 40 };

function makeRecord(overrides: Partial<GbifVernacularName> = {}) {
  return {
    vernacularName: "Matsutake",
    language: "eng",
    source: "Catalogue of Life",
    sourceTaxonKey: 1,
    ...overrides,
  } satisfies GbifVernacularName;
}

function selectNames(records: GbifVernacularName[], selectionLimits = limits) {
  return selectVernacularNames(records, "Tricholoma matsutake", selectionLimits).map(
    ({ name }) => name,
  );
}

describe("selectVernacularNames", () => {
  it("tags each name's language in BCP 47", () => {
    const [name] = selectVernacularNames([makeRecord()], "Tricholoma matsutake", limits);
    expect(name?.language).toBe("en");
  });

  it("merges names that differ only in case, keeping the first spelling", () => {
    expect(selectNames([makeRecord(), makeRecord({ vernacularName: "matsutake" })])).toEqual([
      "Matsutake",
    ]);
  });

  it("collects the checklists that give a name", () => {
    const records = [makeRecord(), makeRecord({ source: "IUCN" })];
    const [name] = selectVernacularNames(records, "Tricholoma matsutake", limits);
    expect(name?.checklistKeys).toEqual(["Catalogue of Life", "IUCN"]);
  });

  it("identifies an untitled checklist by its record of the taxon", () => {
    const records = [makeRecord({ source: undefined, sourceTaxonKey: 7 })];
    const [name] = selectVernacularNames(records, "Tricholoma matsutake", limits);
    expect(name?.checklistKeys).toEqual(["taxon:7"]);
  });

  it("leaves out names without a language", () => {
    expect(selectNames([makeRecord({ language: "" })])).toEqual([]);
  });

  it("leaves out the scientific name", () => {
    expect(selectNames([makeRecord({ vernacularName: "Tricholoma matsutake" })])).toEqual([]);
  });

  it("leaves out names given as Latin", () => {
    expect(selectNames([makeRecord({ language: "lat" })])).toEqual([]);
  });

  it("leaves out romanized names", () => {
    expect(selectNames([makeRecord({ vernacularName: "Matsutake", language: "jpn" })])).toEqual([]);
  });

  it("keeps the names reported most often within a language", () => {
    const records = [
      makeRecord({ vernacularName: "Spicy Knight" }),
      makeRecord({ vernacularName: "Matsutake" }),
      makeRecord({ vernacularName: "Matsutake", source: "IUCN" }),
      makeRecord({ vernacularName: "Pine mushroom" }),
    ];
    expect(selectNames(records)).toEqual(["Matsutake", "Spicy Knight"]);
  });

  it("prefers a first name in another language to a second name in one language", () => {
    const records = [
      makeRecord({ vernacularName: "Matsutake" }),
      makeRecord({ vernacularName: "Spicy Knight" }),
      makeRecord({ vernacularName: "goliatmusseron", language: "swe" }),
    ];
    expect(selectNames(records, { perLanguage: 2, total: 2 })).toEqual([
      "Matsutake",
      "goliatmusseron",
    ]);
  });
});

describe("selectVernacularNames when there are more languages than the limit", () => {
  it("prefers the sample's languages to more often reported names", () => {
    const records = [
      makeRecord({ vernacularName: "goliatmusseron", language: "swe" }),
      makeRecord({ vernacularName: "goliatmusseron", language: "swe", source: "IUCN" }),
      makeRecord({ vernacularName: "マツタケ", language: "jpn" }),
    ];
    expect(selectNames(records, { perLanguage: 2, total: 1 })).toEqual(["マツタケ"]);
  });
});

describe("toOrganismNames", () => {
  const checklists = new Map<string, Checklist>([
    ["Catalogue of Life", { datasetKey: "col", title: "Catalogue of Life", licence: "CC-BY-4.0" }],
    ["IUCN", { datasetKey: "iucn", title: "IUCN", licence: "CC-BY-NC-4.0" }],
  ]);
  const organism = { nodeId: "wikidata:Q509308", rank: "species" };
  const names = [
    { language: "en", name: "Matsutake", checklistKeys: ["IUCN", "Catalogue of Life"] },
  ];

  it("gives the most permissive of the checklists' licences", () => {
    expect(toOrganismNames(organism, names, checklists)[0]?.licence).toBe("CC-BY-4.0");
  });

  it("cites each checklist", () => {
    const [name] = toOrganismNames(organism, names, checklists);
    expect(name?.sources.map(({ datasetId }) => datasetId)).toEqual(["iucn", "col"]);
  });
});

describe("choosePermissiveLicence", () => {
  it("gives unspecified when no licence is known", () => {
    expect(choosePermissiveLicence([])).toBe("unspecified");
  });
});

describe("toSpdxLicence", () => {
  it("reads a CC BY 4.0 licence URL", () => {
    expect(toSpdxLicence("http://creativecommons.org/licenses/by/4.0/legalcode")).toBe("CC-BY-4.0");
  });

  it("reads a CC BY-NC 4.0 licence URL", () => {
    expect(toSpdxLicence("http://creativecommons.org/licenses/by-nc/4.0/legalcode")).toBe(
      "CC-BY-NC-4.0",
    );
  });

  it("reads a CC0 licence URL", () => {
    expect(toSpdxLicence("http://creativecommons.org/publicdomain/zero/1.0/legalcode")).toBe(
      "CC0-1.0",
    );
  });

  it("gives unspecified for anything else", () => {
    expect(toSpdxLicence("UNSPECIFIED")).toBe("unspecified");
  });
});
