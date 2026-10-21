import { describe, expect, it } from "vitest";
import {
  type MangalNetworkContent,
  type MangalNodeIdentity,
  toDateRange,
  toNetworkConnections,
} from "./mangalConnections.ts";
import type { MangalInteraction, MangalNode, MangalReference } from "./mangalRecords.ts";

const visit = {
  nodeFrom: 1,
  nodeTo: 2,
  type: "mutualism",
  date: "1991-09-01",
  value: 115,
  attribute: "number of visit by a pollinator: Individuals seen on a flower",
} satisfies MangalInteraction;

function makeContent(interactions: MangalInteraction[] = [visit]) {
  return {
    network: {
      id: 948,
      name: "kato_1993_19910901_948",
      date: "1991-09-01",
      geometry: { type: "Point", coordinates: [138.3833, 35.5833] },
      description: "Flower visitors at Mt. Kushigata, Yamanashi Prefecture, Japan",
      datasetId: 66,
    },
    dataset: null,
    reference: null as MangalReference | null,
    nodes: [] as MangalNode[],
    interactions,
  } satisfies MangalNetworkContent;
}

const webOfLifeReference = {
  id: 65,
  doi: null,
  firstAuthor: "kato",
  year: "1993",
  bibtex: null,
  paperUrl: null,
  dataUrl: "http://www.web-of-life.es/map.php?type=5",
} satisfies MangalReference;

const webOfLifeContent = {
  ...makeContent(),
  reference: webOfLifeReference,
  nodes: [{ id: 1, networkId: 948, originalName: "Apis cerana M_PL_056", taxonomy: null }],
} satisfies MangalNetworkContent;

const identities = new Map<number, MangalNodeIdentity>([
  [1, { id: "wikidata:Q30034", rank: "species", qualityFlags: [] }],
  [2, { id: "mangal:948/Potentilla sp.", rank: "genus", qualityFlags: ["placeholder_species"] }],
  [3, { id: "wikidata:Q30034", rank: "species", qualityFlags: [] }],
  [4, { id: "mangal:fungi", rank: null, qualityFlags: ["unmatched_name"] }],
]);

function convertOne(overrides: Partial<MangalInteraction> = {}, content = makeContent()) {
  const interaction = { ...visit, ...overrides };
  return toNetworkConnections({ ...content, interactions: [interaction] }, identities)[0];
}

describe("toNetworkConnections", () => {
  it("points from the consumer to the resource, as Mangal does", () => {
    expect([convertOne()?.sourceNodeId, convertOne()?.targetNodeId]).toEqual([
      "wikidata:Q30034",
      "mangal:948/Potentilla sp.",
    ]);
  });

  it("names a mutualism as the Relation Ontology does", () => {
    expect(convertOne()?.relation).toBe("mutualistOf");
  });

  it("keeps the name of a type the Relation Ontology lacks", () => {
    expect(convertOne({ type: "scavenger" })?.relation).toBe("scavenger");
  });

  it("weights a link by a counted value", () => {
    expect(convertOne()?.weight).toBe(115);
  });

  it("does not weight a link that only records presence", () => {
    expect(convertOne({ attribute: "presence/absence", value: 1 })?.weight).toBeNull();
  });

  it("supports the link at the coarser rank of its two nodes", () => {
    expect(convertOne()?.taxonomicLevel).toBe("genus");
  });

  it("gives no rank when a node's rank is unknown", () => {
    expect(convertOne({ nodeTo: 4 })?.taxonomicLevel).toBeNull();
  });

  it("places the link at the network's coordinates", () => {
    const { latitude, longitude } = convertOne() ?? {};
    expect({ latitude, longitude }).toEqual({ latitude: 35.5833, longitude: 138.3833 });
  });

  it("names the place by the network's description", () => {
    expect(convertOne()?.place).toBe(
      "Flower visitors at Mt. Kushigata, Yamanashi Prefecture, Japan",
    );
  });

  it("falls back to the network's date", () => {
    const content = makeContent();
    const network = { ...content.network, date: "1990-01-01" };
    expect(convertOne({ date: null }, { ...content, network })?.date).toBe("1990-01-01");
  });

  it("carries the flags of its nodes", () => {
    expect(convertOne()?.qualityFlags).toEqual(["placeholder_species"]);
  });

  it("flags a link copied from a curated collection", () => {
    const flags = convertOne({}, { ...makeContent(), reference: webOfLifeReference })?.qualityFlags;
    expect(flags).toContain("duplicate_network_copy");
  });

  it("credits only Mangal for a network deposited with it", () => {
    expect(convertOne()?.sources.map(({ datasetId }) => datasetId)).toEqual(["mangal:948"]);
  });

  it("credits Web of Life as well for a network copied from it", () => {
    const sources = convertOne({}, webOfLifeContent)?.sources;
    expect(sources?.map(({ datasetId }) => datasetId)).toEqual([
      "mangal:948",
      "web-of-life:M_PL_056",
    ]);
  });

  it("flags a link between two nodes that were identified as one organism", () => {
    expect(convertOne({ nodeTo: 3 })?.qualityFlags).toEqual(["suspected_error"]);
  });

  it("skips a link to a node the network does not list", () => {
    expect(convertOne({ nodeTo: 99 })).toBeUndefined();
  });

  describe("when a network repeats a link", () => {
    const repeated = makeContent([visit, { ...visit, value: 5, date: "1991-08-01" }]);
    const [merged] = toNetworkConnections(repeated, identities);

    it("merges the repeats into one connection", () => {
      expect(toNetworkConnections(repeated, identities)).toHaveLength(1);
    });

    it("adds up their weights", () => {
      expect(merged?.weight).toBe(120);
    });

    it("counts their records", () => {
      expect(merged?.sources[0]?.recordCount).toBe(2);
    });

    it("counts their records for every dataset it credits", () => {
      const copied = { ...webOfLifeContent, interactions: repeated.interactions };
      const [mergedCopy] = toNetworkConnections(copied, identities);
      expect(mergedCopy?.sources.map(({ recordCount }) => recordCount)).toEqual([2, 2]);
    });

    it("spans their dates", () => {
      expect(merged?.date).toBe("1991-08-01/1991-09-01");
    });
  });
});

describe("toDateRange", () => {
  it("keeps a date shared by both", () => {
    expect(toDateRange("2001-04-01", "2001-04-01")).toBe("2001-04-01");
  });

  it("widens an interval to include another date", () => {
    expect(toDateRange("2001-04-01/2001-05-01", "2001-06-01")).toBe("2001-04-01/2001-06-01");
  });

  it("keeps the one date given", () => {
    expect(toDateRange(null, "2001-04-01")).toBe("2001-04-01");
  });
});
