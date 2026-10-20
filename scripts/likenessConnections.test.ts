import { describe, expect, it } from "vitest";
import { type TraitNode, toLikenessConnections } from "./likenessConnections.ts";
import type { TraitNeighbour } from "./traitNeighbours.ts";

const template = {
  relation: "similar diet and body mass",
  taxonomicLevel: "species",
  licence: "CC0-1.0",
  sources: [],
};

function makeNeighbour(name: string, similarity = 0.9, isTied = false) {
  return {
    record: { name, group: "mammal", traits: null, names: [], gbifHints: {} },
    similarity,
    isTied,
  } satisfies TraitNeighbour<null>;
}

function connect(neighbours: [string, TraitNeighbour<null>[]][], nodes: [string, TraitNode[]][]) {
  return toLikenessConnections(new Map(neighbours), new Map(nodes), template);
}

const vulture = { nodeId: "wikidata:Q1", qualityFlags: [] } satisfies TraitNode;
const devil = { nodeId: "wikidata:Q2", qualityFlags: [] } satisfies TraitNode;
const nodes = [
  ["Gyps fulvus", [vulture]],
  ["Sarcophilus harrisii", [devil]],
] satisfies [string, TraitNode[]][];

describe("toLikenessConnections", () => {
  it("links the subject's node to its neighbour's node", () => {
    const [connection] = connect([["Gyps fulvus", [makeNeighbour("Sarcophilus harrisii")]]], nodes);
    expect([connection?.sourceNodeId, connection?.targetNodeId]).toEqual([
      "wikidata:Q1",
      "wikidata:Q2",
    ]);
  });

  it("records the link as a computed likeness", () => {
    const [connection] = connect([["Gyps fulvus", [makeNeighbour("Sarcophilus harrisii")]]], nodes);
    expect([connection?.kind, connection?.basis]).toEqual(["likeness", "computed"]);
  });

  it("weights the link by similarity, to three decimal places", () => {
    const neighbour = makeNeighbour("Sarcophilus harrisii", 0.87654);
    const [connection] = connect([["Gyps fulvus", [neighbour]]], nodes);
    expect(connection?.weight).toBe(0.877);
  });

  it("keeps the doubts about both nodes", () => {
    const flagged = {
      nodeId: "wikidata:Q2",
      qualityFlags: ["trait_name_synonym"],
    } satisfies TraitNode;
    const [connection] = connect(
      [["Gyps fulvus", [makeNeighbour("Sarcophilus harrisii")]]],
      [
        ["Gyps fulvus", [vulture]],
        ["Sarcophilus harrisii", [flagged]],
      ],
    );
    expect(connection?.qualityFlags).toEqual(["trait_name_synonym"]);
  });

  it("flags a neighbour picked among equally near ones", () => {
    const neighbour = makeNeighbour("Sarcophilus harrisii", 0.9, true);
    const [connection] = connect([["Gyps fulvus", [neighbour]]], nodes);
    expect(connection?.qualityFlags).toEqual(["tied_nearest_neighbour"]);
  });

  it("links two records that are each other's neighbours once", () => {
    const connections = connect(
      [
        ["Gyps fulvus", [makeNeighbour("Sarcophilus harrisii")]],
        ["Sarcophilus harrisii", [makeNeighbour("Gyps fulvus")]],
      ],
      nodes,
    );
    expect(connections).toHaveLength(1);
  });

  it("does not link a node to itself", () => {
    const connections = connect(
      [["Gyps fulvus", [makeNeighbour("Gyps rueppelli")]]],
      [...nodes, ["Gyps rueppelli", [vulture]]],
    );
    expect(connections).toHaveLength(0);
  });
});
