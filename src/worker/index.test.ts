import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "./index";
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
});
