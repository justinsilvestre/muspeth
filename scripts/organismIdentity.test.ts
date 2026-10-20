import { describe, expect, it } from "vitest";
import {
  chooseWikidataTaxon,
  identifyOrganism,
  listOrganismNames,
  parseCommonNames,
  type WikidataTaxon,
} from "./organismIdentity.ts";

const pine = {
  name: "Pinus densiflora",
  externalId: "EOL:1033597",
  rank: "species",
  commonNames: null,
};
const pineEntity = {
  qid: "Q1044186",
  taxonNames: ["Pinus densiflora"],
  labels: [{ language: "ja", name: "アカマツ" }],
} satisfies WikidataTaxon;
const otherEntity = {
  qid: "Q15889125",
  taxonNames: ["Pinus densiflora var. ussuriensis"],
  labels: [],
};

describe("chooseWikidataTaxon", () => {
  it("prefers the item whose taxon name matches exactly", () => {
    const choice = chooseWikidataTaxon(pine.name, [otherEntity, pineEntity]);
    expect(choice?.taxon.qid).toBe("Q1044186");
  });

  it("marks a choice between several exact matches as ambiguous", () => {
    const twin = { ...pineEntity, qid: "Q9" };
    expect(chooseWikidataTaxon(pine.name, [pineEntity, twin])?.isAmbiguous).toBe(true);
  });

  it("takes the oldest item among ambiguous matches", () => {
    const twin = { ...pineEntity, qid: "Q9" };
    expect(chooseWikidataTaxon(pine.name, [pineEntity, twin])?.taxon.qid).toBe("Q9");
  });

  it("returns null without candidates", () => {
    expect(chooseWikidataTaxon(pine.name, [])).toBeNull();
  });
});

describe("identifyOrganism", () => {
  it("uses the Wikidata item when there is one", () => {
    const choice = { taxon: pineEntity, isAmbiguous: false };
    expect(identifyOrganism(pine, choice).id).toBe("wikidata:Q1044186");
  });

  it("uses an existing node's identifier when given one", () => {
    expect(identifyOrganism(pine, null, "wikidata:Q1").id).toBe("wikidata:Q1");
  });

  it("falls back to GloBI's identifier, with a lowercase prefix", () => {
    expect(identifyOrganism(pine, null).id).toBe("eol:1033597");
  });

  it("identifies an unmatched name by the name itself", () => {
    const unmatched = { ...pine, name: "Agaricales -- Tricholomataceae.", externalId: "no:match" };
    expect(identifyOrganism(unmatched, null).id).toBe("globi:Agaricales -- Tricholomataceae.");
  });

  it("flags an unmatched name", () => {
    expect(identifyOrganism({ ...pine, externalId: "no:match" }, null).qualityFlags).toEqual([
      "unmatched_name",
    ]);
  });

  it("flags an ambiguous Wikidata match", () => {
    const choice = { taxon: pineEntity, isAmbiguous: true };
    expect(identifyOrganism(pine, choice).qualityFlags).toEqual(["ambiguous_wikidata_id"]);
  });
});

describe("parseCommonNames", () => {
  it("reads each name with its language", () => {
    expect(parseCommonNames("human @en | Mensch @de")).toEqual([
      { language: "en", name: "human" },
      { language: "de", name: "Mensch" },
    ]);
  });

  it("skips names without a language", () => {
    expect(parseCommonNames("human | Mensch @de")).toHaveLength(1);
  });
});

describe("listOrganismNames", () => {
  it("combines GloBI's common names with Wikidata labels", () => {
    const taxon = { ...pine, commonNames: "Japanese red pine @en" };
    expect(listOrganismNames(taxon, { taxon: pineEntity, isAmbiguous: false })).toEqual([
      { language: "en", name: "Japanese red pine" },
      { language: "ja", name: "アカマツ" },
    ]);
  });

  it("leaves out labels that only repeat the scientific name", () => {
    const entity = { ...pineEntity, labels: [{ language: "en", name: "Pinus densiflora" }] };
    expect(listOrganismNames(pine, { taxon: entity, isAmbiguous: false })).toEqual([]);
  });

  it("lists each name once", () => {
    const taxon = { ...pine, commonNames: "アカマツ @ja" };
    expect(listOrganismNames(taxon, { taxon: pineEntity, isAmbiguous: false })).toHaveLength(1);
  });
});
