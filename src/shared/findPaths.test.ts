import { describe, expect, it } from "vitest";
import { findPaths } from "./findPaths";
import type { ConnectionKind } from "./graph";
import type { GraphEdge } from "./graphExport";
import { buildPathGraph } from "./pathGraph";

function edge(id: number, sourceNodeId: string, targetNodeId: string, kind: ConnectionKind) {
  return {
    id,
    sourceNodeId,
    targetNodeId,
    kind,
    relation: "relatedTo",
    basis: "observed",
    source: "test",
    qualityFlags: [],
  } satisfies GraphEdge;
}

function interaction(id: number, sourceNodeId: string, targetNodeId: string) {
  return edge(id, sourceNodeId, targetNodeId, "interaction");
}

/** Joins each pair of consecutive nodes with an interaction, numbering connections from `firstId`. */
function chain(nodeIds: string[], firstId: number) {
  return nodeIds
    .slice(1)
    .map((nodeId, index) => interaction(firstId + index, nodeIds[index] ?? "", nodeId));
}

/** Gives a node `count` extra neighbours that lead nowhere, making it a hub. */
function spokes(nodeId: string, count: number, firstId: number) {
  return Array.from({ length: count }, (_, index) =>
    interaction(firstId + index, nodeId, `${nodeId}-spoke-${index}`),
  );
}

function routesBetween(edges: GraphEdge[], fromId: string, toId: string, limit = 5) {
  return findPaths(buildPathGraph(edges), fromId, toId, { limit }).map((path) =>
    path.nodeIds.join(" "),
  );
}

describe("findPaths", () => {
  it("finds a direct connection as a one-step path", () => {
    expect(routesBetween([interaction(1, "a", "b")], "a", "b")).toEqual(["a b"]);
  });

  it("follows connections in either direction", () => {
    expect(routesBetween(chain(["c", "b", "a"], 1), "a", "c")).toEqual(["a b c"]);
  });

  it("finds no paths between unconnected nodes", () => {
    expect(routesBetween([interaction(1, "a", "b"), interaction(2, "c", "d")], "a", "d")).toEqual(
      [],
    );
  });

  it("finds no paths from a node to itself", () => {
    expect(routesBetween([interaction(1, "a", "b")], "a", "a")).toEqual([]);
  });

  it("finds no paths from an unknown node", () => {
    expect(routesBetween([interaction(1, "a", "b")], "x", "b")).toEqual([]);
  });

  it("never visits a node twice", () => {
    const edges = [...chain(["a", "b", "c", "d"], 1), interaction(4, "c", "a")];
    expect(routesBetween(edges, "a", "d")).toEqual(["a c d", "a b c d"]);
  });

  it("never passes through the end node on the way", () => {
    const edges = [
      ...chain(["a", "b", "c"], 1),
      interaction(3, "b", "d"),
      interaction(4, "d", "c"),
    ];
    expect(routesBetween(edges, "a", "b")).toEqual(["a b"]);
  });

  it("takes at most four steps by default", () => {
    expect(routesBetween(chain(["a", "b", "c", "d", "e", "f"], 1), "a", "f")).toEqual([]);
  });

  it("takes at most the given number of steps", () => {
    const graph = buildPathGraph(chain(["a", "b", "c"], 1));
    expect(findPaths(graph, "a", "c", { maxSteps: 1 })).toEqual([]);
  });

  it("returns at most the given number of paths", () => {
    const edges = ["b", "c", "d"].flatMap((via, index) => chain(["a", via, "z"], index * 2));
    expect(routesBetween(edges, "a", "z", 2)).toHaveLength(2);
  });

  it("returns five paths by default", () => {
    const edges = ["b", "c", "d", "e", "f", "g"].flatMap((via, index) =>
      chain(["a", via, "z"], index * 2),
    );
    expect(findPaths(buildPathGraph(edges), "a", "z")).toHaveLength(5);
  });

  it("stops searching after the given number of expansions", () => {
    const graph = buildPathGraph(chain(["a", "b", "c", "d"], 1));
    expect(findPaths(graph, "a", "d", { maxExpansions: 2 })).toEqual([]);
  });

  describe("when ranking", () => {
    it("ranks a direct connection first", () => {
      const edges = [...chain(["a", "b", "c"], 1), interaction(3, "a", "c")];
      expect(routesBetween(edges, "a", "c")[0]).toBe("a c");
    });

    it("ranks a path through a hub below a longer path through quiet nodes", () => {
      const edges = [
        ...chain(["a", "hub", "z"], 1),
        ...chain(["a", "b", "c", "z"], 3),
        ...spokes("hub", 200, 10),
      ];
      expect(routesBetween(edges, "a", "z")).toEqual(["a b c z", "a hub z"]);
    });

    it("ranks a path that crosses several kinds of connection above one that crosses one", () => {
      const edges = [
        ...chain(["a", "b", "z"], 1),
        edge(3, "a", "c", "interaction"),
        edge(4, "c", "z", "likeness"),
      ];
      expect(routesBetween(edges, "a", "z")).toEqual(["a c z", "a b z"]);
    });

    it("discounts hubs by the degrees it is given", () => {
      const edges = [...chain(["a", "b", "z"], 1), ...chain(["a", "c", "z"], 3)];
      const graph = buildPathGraph(edges, new Map([["b", 500]]));
      expect(findPaths(graph, "a", "z").map((path) => path.nodeIds.join(" "))).toEqual([
        "a c z",
        "a b z",
      ]);
    });

    it("orders paths from cheapest to dearest", () => {
      const edges = [...chain(["a", "b", "c", "z"], 1), ...chain(["a", "d", "z"], 4)];
      const costs = findPaths(buildPathGraph(edges), "a", "z").map((path) => path.cost);
      expect(costs).toEqual([...costs].sort((x, y) => x - y));
    });

    it("costs a direct connection one", () => {
      const [path] = findPaths(buildPathGraph([interaction(1, "a", "b")]), "a", "b");
      expect(path?.cost).toBe(1);
    });
  });

  describe("for each path", () => {
    const edges = [
      interaction(1, "b", "a"),
      edge(2, "b", "c", "likeness"),
      edge(3, "c", "b", "shared_culture"),
    ];
    const [path] = findPaths(buildPathGraph(edges), "a", "c");

    it("lists each step from the start towards the end", () => {
      expect(path?.steps.map((step) => [step.fromNodeId, step.toNodeId])).toEqual([
        ["a", "b"],
        ["b", "c"],
      ]);
    });

    it("lists every connection between the two nodes of a step", () => {
      expect(path?.steps[1]?.connections.map(({ id }) => id)).toEqual([2, 3]);
    });

    it("keeps each connection's own direction", () => {
      expect(path?.steps[0]?.connections[0]).toMatchObject({
        sourceNodeId: "b",
        targetNodeId: "a",
      });
    });

    it("lists the kinds of connection it crosses", () => {
      expect(path?.kinds).toEqual(["interaction", "likeness", "shared_culture"]);
    });
  });
});
