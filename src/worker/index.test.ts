import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "./index";
import { chain, insertConnections } from "./test/insertConnections";
import { insertSampleGraph } from "./test/insertSampleGraph";
import { insertSampleTaxonomy } from "./test/insertSampleTaxonomy";

describe("the API", () => {
  describe("GET /api/health", () => {
    it("reports that the API is up", async () => {
      const response = await app.request("/api/health", {}, env);
      expect(await response.json()).toEqual({ ok: true });
    });
  });

  describe("GET /api/nodes", () => {
    it("lists every node", async () => {
      await insertSampleGraph();
      const response = await app.request("/api/nodes", {}, env);
      const { nodes } = await response.json<{ nodes: unknown[] }>();
      expect(nodes).toHaveLength(2);
    });
  });

  describe("GET /api/nodes/:id/connections", () => {
    it("lists the node's connections", async () => {
      await insertSampleGraph();
      const response = await app.request("/api/nodes/pine/connections", {}, env);
      const { connections } = await response.json<{ connections: unknown[] }>();
      expect(connections).toHaveLength(1);
    });

    it("responds with 404 for an unknown node", async () => {
      const response = await app.request("/api/nodes/unknown/connections", {}, env);
      expect(response.status).toBe(404);
    });

    it("filters the connections", async () => {
      await insertSampleGraph();
      const response = await app.request(
        "/api/nodes/pine/connections?notFlaggedWith=unmatched_name",
        {},
        env,
      );
      const { connections } = await response.json<{ connections: unknown[] }>();
      expect(connections).toHaveLength(0);
    });

    it("responds with 400 for an invalid filter", async () => {
      await insertSampleGraph();
      const response = await app.request("/api/nodes/pine/connections?kind=friendship", {}, env);
      expect(response.status).toBe(400);
    });

    it("says why a filter is invalid", async () => {
      await insertSampleGraph();
      const response = await app.request("/api/nodes/pine/connections?basis=guessed", {}, env);
      const { error } = await response.json<{ error: string }>();
      expect(error).toMatch(/^Unknown basis "guessed"/);
    });
  });

  describe("GET /api/connections", () => {
    it("lists the connections near a place", async () => {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", latitude: 35.03, longitude: 135.78 },
        { id: 2, sourceNodeId: "a", targetNodeId: "c", latitude: 43.06, longitude: 141.35 },
      ]);
      const response = await app.request("/api/connections?near=35.01,135.77", {}, env);
      const { connections } = await response.json<{ connections: { id: number }[] }>();
      expect(connections.map(({ id }) => id)).toEqual([1]);
    });

    it("lists the connections within a period", async () => {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", date: "1990/1992" },
        { id: 2, sourceNodeId: "a", targetNodeId: "c", date: "2005" },
      ]);
      const response = await app.request("/api/connections?from=1991&to=1991", {}, env);
      const { connections } = await response.json<{ connections: { id: number }[] }>();
      expect(connections.map(({ id }) => id)).toEqual([1]);
    });

    it("responds with 400 without a place or period", async () => {
      const response = await app.request("/api/connections", {}, env);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/paths", () => {
    it("lists the paths between two nodes, step by step", async () => {
      await insertConnections(chain(["a", "b", "c"], 1));
      const response = await app.request("/api/paths?from=a&to=c", {}, env);
      const { paths } = await response.json<{ paths: { nodeIds: string[] }[] }>();
      expect(paths.map(({ nodeIds }) => nodeIds)).toEqual([["a", "b", "c"]]);
    });

    it("responds with 404 for an unknown node", async () => {
      await insertConnections(chain(["a", "b"], 1));
      const response = await app.request("/api/paths?from=a&to=unknown", {}, env);
      expect(response.status).toBe(404);
    });

    it("responds with 400 without an end", async () => {
      const response = await app.request("/api/paths?from=a", {}, env);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/graph", () => {
    it("lists every node and the connections that pass the filter", async () => {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", kind: "likeness" },
        { id: 2, sourceNodeId: "a", targetNodeId: "c" },
      ]);
      const response = await app.request("/api/graph?kind=likeness", {}, env);
      const graph = await response.json<{ nodes: unknown[]; edges: unknown[] }>();
      expect([graph.nodes.length, graph.edges.length]).toEqual([3, 1]);
    });
  });

  describe("GET /api/sources", () => {
    it("names the sources of the connections", async () => {
      await insertSampleGraph();
      const response = await app.request("/api/sources", {}, env);
      expect(await response.json()).toEqual({ sources: ["test"] });
    });
  });

  describe("GET /api/taxonomy", () => {
    it("lists every taxon", async () => {
      await insertSampleTaxonomy();
      const response = await app.request("/api/taxonomy", {}, env);
      const { taxa } = await response.json<{ taxa: unknown[] }>();
      expect(taxa).toHaveLength(3);
    });

    it("lists where each organism is placed", async () => {
      await insertSampleTaxonomy();
      const response = await app.request("/api/taxonomy", {}, env);
      const { placements } = await response.json<{ placements: unknown[] }>();
      expect(placements).toHaveLength(1);
    });
  });

  describe("when D1 has reached its daily limit", () => {
    const exhaustedEnv = {
      DB: {
        prepare() {
          throw new Error(
            "D1_ERROR: Your account has exceeded D1's free tier daily row read limit. Upgrade to a paid plan or wait until tomorrow (midnight UTC) to continue.",
          );
        },
      },
    };

    it("responds with 503", async () => {
      const response = await app.request("/api/nodes", {}, exhaustedEnv);
      expect(response.status).toBe(503);
    });

    it("says when to retry", async () => {
      const response = await app.request("/api/nodes", {}, exhaustedEnv);
      expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    });

    it("explains the failure", async () => {
      const response = await app.request("/api/nodes", {}, exhaustedEnv);
      expect(await response.json()).toEqual({
        error:
          "The database has reached its daily usage limit. Please try again after midnight UTC.",
      });
    });
  });
});
