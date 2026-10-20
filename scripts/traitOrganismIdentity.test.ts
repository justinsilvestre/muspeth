import { describe, expect, it } from "vitest";
import type { GbifTaxon } from "./gbifTaxon.ts";
import {
  chooseTraitWikidataTaxon,
  describeTraitOrganism,
  listGbifIds,
  toTraitNodeDraft,
} from "./traitOrganismIdentity.ts";
import type { TraitRecord } from "./traitRecord.ts";

const blueTit = {
  name: "Parus caeruleus",
  group: "bird",
  traits: null,
  names: [{ language: "en", name: "Blue Tit" }],
  gbifHints: {},
} satisfies TraitRecord<null>;

const synonymMatch = {
  key: 8191482,
  acceptedKey: 2487879,
  canonicalName: "Parus caeruleus",
  rank: "SPECIES",
  isSynonym: true,
  matchType: "EXACT",
  kingdom: "Animalia",
  phylum: "Chordata",
  class: "Aves",
  genus: "Cyanistes",
  species: "Cyanistes caeruleus",
} satisfies GbifTaxon;

describe("describeTraitOrganism", () => {
  it("names the organism by its accepted name", () => {
    expect(describeTraitOrganism("eltontraits", blueTit, synonymMatch).taxon.name).toBe(
      "Cyanistes caeruleus",
    );
  });

  it("flags an organism listed under a synonym", () => {
    expect(describeTraitOrganism("eltontraits", blueTit, synonymMatch).qualityFlags).toEqual([
      "trait_name_synonym",
    ]);
  });

  it("identifies the organism by its accepted GBIF taxon", () => {
    expect(describeTraitOrganism("eltontraits", blueTit, synonymMatch).taxon.externalId).toBe(
      "GBIF:2487879",
    );
  });

  it("names the organism as GBIF spells it", () => {
    const accepted = { ...synonymMatch, isSynonym: false, canonicalName: "Parus caeruleus" };
    const record = { ...blueTit, name: "Parus caerulaeus" };
    expect(describeTraitOrganism("eltontraits", record, accepted).taxon.name).toBe(
      "Parus caeruleus",
    );
  });

  it("names a genus listed under a synonym by its accepted genus", () => {
    const genus = { ...synonymMatch, rank: "GENUS", species: null };
    const record = { ...blueTit, name: "Parus" };
    expect(describeTraitOrganism("fungaltraits", record, genus).taxon.name).toBe("Cyanistes");
  });

  describe("without a GBIF match", () => {
    const described = describeTraitOrganism("eltontraits", blueTit, null);

    it("identifies the organism by the database's own name", () => {
      expect(described.taxon.externalId).toBe("eltontraits:Parus caeruleus");
    });

    it("flags the name as unmatched", () => {
      expect(described.qualityFlags).toEqual(["unmatched_name"]);
    });
  });
});

describe("listGbifIds", () => {
  it("lists the matched and the accepted taxon", () => {
    expect(listGbifIds(synonymMatch)).toEqual(["gbif:8191482", "gbif:2487879"]);
  });
});

describe("chooseTraitWikidataTaxon", () => {
  const vulture = {
    qid: "Q1",
    taxonNames: ["Gyps rueppelli"],
    labels: [],
    externalIds: ["gbif:2480384"],
  };
  const hydrozoan = { qid: "Q4005738", taxonNames: ["Amphinema"], labels: [], externalIds: [] };
  const fungus = {
    qid: "Q16528286",
    taxonNames: ["Amphinema"],
    labels: [],
    externalIds: ["gbif:2554032"],
  };

  it("takes the one item that names the GBIF taxon, whatever its spelling", () => {
    const choice = chooseTraitWikidataTaxon("Gyps rueppellii", [vulture], ["gbif:2480384"]);
    expect(choice?.taxon.qid).toBe("Q1");
  });

  it("otherwise takes a namesake", () => {
    expect(chooseTraitWikidataTaxon("Amphinema", [hydrozoan], [])?.taxon.qid).toBe("Q4005738");
  });

  it("rejects a namesake that names another GBIF taxon", () => {
    const plant = { ...fungus, externalIds: ["gbif:1"] };
    expect(chooseTraitWikidataTaxon("Amphinema", [plant], ["gbif:2554032"])).toBeNull();
  });
});

describe("toTraitNodeDraft", () => {
  const wikidataTaxon = {
    qid: "Q25485",
    taxonNames: ["Cyanistes caeruleus"],
    labels: [
      { language: "en", name: "Blue Tit" },
      { language: "ja", name: "アオガラ" },
      { language: "de", name: "Cyanistes caeruleus" },
    ],
    externalIds: [],
  };

  it("merges the database's names with Wikidata's, leaving out the scientific name", () => {
    const draft = toTraitNodeDraft(
      "wikidata:Q25485",
      "Cyanistes caeruleus",
      blueTit,
      wikidataTaxon,
    );
    expect(draft.names).toEqual([
      { language: "en", name: "Blue Tit" },
      { language: "ja", name: "アオガラ" },
    ]);
  });

  it("keeps one of two names that differ only in case", () => {
    const record = { ...blueTit, names: [{ language: "en", name: "Blue tit" }] };
    const draft = toTraitNodeDraft("wikidata:Q25485", "Cyanistes caeruleus", record, wikidataTaxon);
    expect(draft.names.filter(({ language }) => language === "en")).toHaveLength(1);
  });
});
