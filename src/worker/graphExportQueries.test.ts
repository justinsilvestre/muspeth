import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../shared/connectionFilter";
import { exportGraph, listConnectionSourceNames } from "./graphExportQueries";
import { insertConnections } from "./test/insertConnections";

describe("exportGraph", () => {
  it("lists every node by ID", async () => {
    await insertConnections([{ id: 1, sourceNodeId: "b", targetNodeId: "a" }]);
    const { nodes } = await exportGraph(env.DB, emptyConnectionFilter);
    expect(nodes).toEqual([
      { id: "a", kind: "organism", label: "a" },
      { id: "b", kind: "organism", label: "b" },
    ]);
  });

  it("lists each connection in its compact form", async () => {
    await insertConnections([
      { id: 1, sourceNodeId: "a", targetNodeId: "b", qualityFlags: ["unmatched_name"] },
    ]);
    const { edges } = await exportGraph(env.DB, emptyConnectionFilter);
    expect(edges).toEqual([
      {
        id: 1,
        sourceNodeId: "a",
        targetNodeId: "b",
        kind: "interaction",
        relation: "relatedTo",
        basis: "observed",
        source: "test",
        licence: "CC0-1.0",
        qualityFlags: ["unmatched_name"],
      },
    ]);
  });

  it("lists only the connections that pass the filter", async () => {
    await insertConnections([
      { id: 1, sourceNodeId: "a", targetNodeId: "b", basis: "computed" },
      { id: 2, sourceNodeId: "a", targetNodeId: "c" },
    ]);
    const filter = { ...emptyConnectionFilter, bases: ["computed" as const] };
    const { edges } = await exportGraph(env.DB, filter);
    expect(edges.map(({ id }) => id)).toEqual([1]);
  });
});

describe("listConnectionSourceNames", () => {
  it("names each source once, in order", async () => {
    await insertConnections([
      { id: 1, sourceNodeId: "a", targetNodeId: "b", source: "mangal" },
      { id: 2, sourceNodeId: "a", targetNodeId: "c", source: "globi" },
      { id: 3, sourceNodeId: "a", targetNodeId: "d", source: "globi" },
    ]);
    expect(await listConnectionSourceNames(env.DB)).toEqual(["globi", "mangal"]);
  });
});
