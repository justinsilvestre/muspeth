import { describe, expect, it } from "vitest";
import { toFungalHostConnections } from "./fungalHostConnections.ts";
import type { FungalHostRecord } from "./fungalHosts.ts";

const template = { licence: "NOASSERTION", sources: [] };

const chalciporus = {
  genus: "Chalciporus",
  gbifHints: {},
  hosts: [
    {
      name: "Amanita",
      rank: "genus",
      englishName: null,
      gbifHints: {},
      qualityFlags: [],
      relation: "parasiteOf",
    },
  ],
} satisfies FungalHostRecord;

const fungi = new Map([["Chalciporus", [{ nodeId: "wikidata:Q1", qualityFlags: [] }]]]);

describe("toFungalHostConnections", () => {
  it("links the fungus to its host at the coarser of their ranks", () => {
    const hosts = new Map([
      ["Amanita", [{ nodeId: "wikidata:Q2", qualityFlags: ["unmatched_name" as const] }]],
    ]);
    expect(toFungalHostConnections([chalciporus], fungi, hosts, template)).toEqual([
      expect.objectContaining({
        sourceNodeId: "wikidata:Q1",
        targetNodeId: "wikidata:Q2",
        relation: "parasiteOf",
        taxonomicLevel: "genus",
        qualityFlags: ["unmatched_name"],
      }),
    ]);
  });

  it("skips a host that was not identified", () => {
    expect(toFungalHostConnections([chalciporus], fungi, new Map(), template)).toEqual([]);
  });

  it("skips a host that is the fungus itself", () => {
    const hosts = new Map([["Amanita", [{ nodeId: "wikidata:Q1", qualityFlags: [] }]]]);
    expect(toFungalHostConnections([chalciporus], fungi, hosts, template)).toEqual([]);
  });

  it("gives one link, carrying the flags of both, for two genera standing for one node", () => {
    const synonym = { ...chalciporus, genus: "Chalciporus synonym" };
    const twoGenera = new Map([
      ["Chalciporus", [{ nodeId: "wikidata:Q1", qualityFlags: [] }]],
      [
        "Chalciporus synonym",
        [{ nodeId: "wikidata:Q1", qualityFlags: ["trait_name_synonym" as const] }],
      ],
    ]);
    const hosts = new Map([["Amanita", [{ nodeId: "wikidata:Q2", qualityFlags: [] }]]]);
    const links = toFungalHostConnections([chalciporus, synonym], twoGenera, hosts, template);
    expect(links.map(({ qualityFlags }) => qualityFlags)).toEqual([["trait_name_synonym"]]);
  });
});
