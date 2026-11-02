import { describe, expect, it } from "vitest";
import { toGeneTransferDrafts } from "./geneTransferConnections.ts";
import type { GeneTransfer } from "./grassGeneTransfers.ts";

const template = { licence: "CC-BY-NC-ND-4.0", sources: [] };

const transfer = {
  id: "Triticum_aestivum_TRIAE_1",
  geneId: "TRIAE_1.1",
  protein: "Xylanase inhibitor protein 1",
  donor: { name: "Paniceae", rank: "tribe" },
  recipients: [
    { name: "Triticum aestivum", rank: "species", qualityFlags: [] },
    { name: "Aegilops tauschii", rank: "species", qualityFlags: ["fuzzy_name_match"] },
  ],
} satisfies GeneTransfer;

const organisms = new Map([
  ["Triticum aestivum", [{ nodeId: "wikidata:Q161098", qualityFlags: [] }]],
  ["Paniceae", [{ nodeId: "wikidata:Q1", qualityFlags: ["unmatched_name" as const] }]],
]);

describe("toGeneTransferDrafts", () => {
  it("makes a node of the gene, named by its protein", () => {
    expect(toGeneTransferDrafts([transfer], organisms, template).nodes).toEqual([
      {
        id: "grass-gene-transfers:Triticum_aestivum_TRIAE_1",
        kind: "compound",
        label: "Xylanase inhibitor protein 1 (TRIAE_1.1)",
        names: [],
      },
    ]);
  });

  it("links each identified grass and the donor lineage to the gene", () => {
    const { connections } = toGeneTransferDrafts([transfer], organisms, template);
    expect(connections.map((c) => [c.sourceNodeId, c.relation, c.taxonomicLevel])).toEqual([
      ["wikidata:Q161098", "carries by lateral transfer", "species"],
      ["wikidata:Q1", "gave by lateral transfer", "tribe"],
    ]);
  });

  it("carries the lineage's flags onto its link", () => {
    const { connections } = toGeneTransferDrafts([transfer], organisms, template);
    expect(connections[1]?.qualityFlags).toEqual(["unmatched_name"]);
  });
});
