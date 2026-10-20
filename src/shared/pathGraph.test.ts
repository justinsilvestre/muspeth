import { describe, expect, it } from "vitest";
import type { GraphEdge } from "./graphExport";
import { buildPathGraph, measureStepsFrom, type PathGraph } from "./pathGraph";

function edge(id: number, sourceNodeId: string, targetNodeId: string) {
  return {
    id,
    sourceNodeId,
    targetNodeId,
    kind: "interaction",
    relation: "interactsWith",
    basis: "observed",
    source: "test",
    qualityFlags: [],
  } satisfies GraphEdge;
}

function listEdgeIdsBetween(graph: PathGraph, nodeId: string, neighborId: string) {
  return graph.edgesByNeighborId
    .get(nodeId)
    ?.get(neighborId)
    ?.map(({ id }) => id);
}

describe("buildPathGraph", () => {
  it("lists each connection under both of its nodes", () => {
    const graph = buildPathGraph([edge(1, "a", "b")]);
    expect(listEdgeIdsBetween(graph, "b", "a")).toEqual([1]);
  });

  it("groups connections between the same two nodes", () => {
    const graph = buildPathGraph([edge(1, "a", "b"), edge(2, "b", "a")]);
    expect(listEdgeIdsBetween(graph, "a", "b")).toEqual([1, 2]);
  });

  it("leaves out connections from a node to itself", () => {
    const graph = buildPathGraph([edge(1, "a", "a")]);
    expect(graph.edgesByNeighborId.has("a")).toBe(false);
  });

  describe("degreeOf", () => {
    it("counts distinct neighbours", () => {
      const graph = buildPathGraph([edge(1, "a", "b"), edge(2, "a", "b"), edge(3, "c", "a")]);
      expect(graph.degreeOf("a")).toBe(2);
    });

    it("prefers the degrees it is given", () => {
      const graph = buildPathGraph([edge(1, "a", "b")], new Map([["a", 40]]));
      expect(graph.degreeOf("a")).toBe(40);
    });

    it("counts no neighbours for an unknown node", () => {
      expect(buildPathGraph([]).degreeOf("a")).toBe(0);
    });
  });
});

describe("measureStepsFrom", () => {
  const graph = buildPathGraph([edge(1, "a", "b"), edge(2, "b", "c"), edge(3, "c", "d")]);

  it("measures each node's distance in steps", () => {
    expect(measureStepsFrom(graph, "a", 3)).toEqual(
      new Map([
        ["a", 0],
        ["b", 1],
        ["c", 2],
        ["d", 3],
      ]),
    );
  });

  it("leaves out nodes beyond the maximum number of steps", () => {
    expect(measureStepsFrom(graph, "a", 2).has("d")).toBe(false);
  });
});
