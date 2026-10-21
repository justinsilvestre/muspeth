import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../shared/connectionFilter";
import { findPaths } from "../shared/findPaths";
import { buildPathGraph } from "../shared/pathGraph";
import type { PathQuery } from "../shared/pathQuery";
import { exportGraph } from "./graphExportQueries";
import { findPathsBetween } from "./pathQueries";
import { chain, insertConnections } from "./test/insertConnections";

function query(fromId: string, toId: string, fields: Partial<PathQuery> = {}) {
  return { fromId, toId, limit: 5, maxSteps: 4, filter: emptyConnectionFilter, ...fields };
}

async function routesBetween(fromId: string, toId: string, fields: Partial<PathQuery> = {}) {
  const paths = await findPathsBetween(env.DB, query(fromId, toId, fields));
  return paths.map((path) => path.nodeIds.join(" "));
}

/** Gives a node `count` extra neighbours, each with a neighbour of its own, making it a hub. */
function spokes(nodeId: string, count: number, firstId: number) {
  return Array.from({ length: count }, (_, index) =>
    chain([nodeId, `${nodeId}-spoke-${index}`, `${nodeId}-rim-${index}`], firstId + index * 2),
  ).flat();
}

describe("findPathsBetween", () => {
  it("finds a direct connection", async () => {
    await insertConnections(chain(["a", "b"], 1));
    expect(await routesBetween("a", "b")).toEqual(["a b"]);
  });

  it("finds a path of four steps", async () => {
    await insertConnections(chain(["a", "b", "c", "d", "e"], 1));
    expect(await routesBetween("a", "e")).toEqual(["a b c d e"]);
  });

  it("finds no path of more than four steps", async () => {
    await insertConnections(chain(["a", "b", "c", "d", "e", "f"], 1));
    expect(await routesBetween("a", "f")).toEqual([]);
  });

  it("finds no path longer than the given number of steps", async () => {
    await insertConnections(chain(["a", "b", "c"], 1));
    expect(await routesBetween("a", "c", { maxSteps: 1 })).toEqual([]);
  });

  it("leaves out connections that do not pass the filter", async () => {
    await insertConnections([
      ...chain(["a", "b", "z"], 1),
      { id: 3, sourceNodeId: "a", targetNodeId: "c", qualityFlags: ["suspected_error"] },
      { id: 4, sourceNodeId: "c", targetNodeId: "z" },
    ]);
    const filter = { ...emptyConnectionFilter, notFlaggedWith: ["suspected_error" as const] };
    expect(await routesBetween("a", "z", { filter })).toEqual(["a b z"]);
  });

  describe("when a node has more neighbours than the limit", () => {
    async function insertTwoRoutes() {
      await insertConnections([
        ...chain(["a", "busy", "z"], 1),
        ...chain(["a", "quiet", "z"], 3),
        ...spokes("busy", 3, 100),
      ]);
    }

    it("follows only the neighbours with the fewest connections", async () => {
      await insertTwoRoutes();
      const paths = await findPathsBetween(env.DB, query("a", "z"), 1);
      expect(paths.map((path) => path.nodeIds.join(" "))).toEqual(["a quiet z"]);
    });
  });

  it("ranks paths as a search over the whole graph would", async () => {
    await insertConnections([
      ...chain(["a", "hub", "c", "z"], 1),
      ...chain(["a", "b", "d", "e", "z"], 4),
      ...spokes("hub", 30, 100),
      ...spokes("d", 3, 200),
    ]);
    const { edges } = await exportGraph(env.DB, emptyConnectionFilter);
    const expected = findPaths(buildPathGraph(edges), "a", "z");
    expect(await findPathsBetween(env.DB, query("a", "z"))).toEqual(expected);
  });
});
