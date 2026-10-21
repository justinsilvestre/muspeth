import { describe, expect, it } from "vitest";
import type { RankedPath } from "../../shared/findPaths";
import type { GraphEdge } from "../../shared/graphExport";
import { listLegendKinds } from "./listLegendKinds";

const edge = {
  id: 1,
  sourceNodeId: "a",
  targetNodeId: "b",
  kind: "likeness",
  relation: "resembles",
  basis: "computed",
  source: "traits",
  licence: "CC0-1.0",
  qualityFlags: [],
} satisfies GraphEdge;

const path = {
  nodeIds: ["a", "b", "c"],
  steps: [
    { fromNodeId: "a", toNodeId: "b", connections: [edge] },
    {
      fromNodeId: "b",
      toNodeId: "c",
      connections: [{ ...edge, sourceNodeId: "b", targetNodeId: "c", kind: "interaction" }],
    },
  ],
  kinds: ["likeness", "interaction"],
  neighborCounts: [1, 2, 1],
  cost: 2,
} satisfies RankedPath;

const kindOf = (nodeId: string) => (nodeId === "b" ? "compound" : "organism");

describe("listLegendKinds", () => {
  it("lists the kinds of the nodes drawn, in the vocabulary's order", () => {
    expect(listLegendKinds([path], kindOf).nodeKinds).toEqual(["organism", "compound"]);
  });

  it("lists the kinds of the connections drawn, in the vocabulary's order", () => {
    expect(listLegendKinds([path], kindOf).connectionKinds).toEqual(["interaction", "likeness"]);
  });

  it("says whether any connection drawn is not observed", () => {
    expect(listLegendKinds([path], kindOf).hasUnobserved).toBe(true);
  });
});
