import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { findNode, listConnections, listNodes } from "./graphQueries";
import { insertSampleGraph } from "./test/insertSampleGraph";

describe("listNodes", () => {
  it("orders nodes by label", async () => {
    await insertSampleGraph();
    const nodes = await listNodes(env.DB);
    expect(nodes.map((node) => node.id)).toEqual(["pine", "fungus"]);
  });

  it("includes each node's names", async () => {
    await insertSampleGraph();
    const [pine] = await listNodes(env.DB);
    expect(pine?.names).toEqual([{ language: "ja", name: "アカマツ" }]);
  });

  it("gives an empty list of names to a node without any", async () => {
    await insertSampleGraph();
    const [, fungus] = await listNodes(env.DB);
    expect(fungus?.names).toEqual([]);
  });
});

describe("findNode", () => {
  it("returns null for an unknown ID", async () => {
    expect(await findNode(env.DB, "unknown")).toBeNull();
  });
});

describe("listConnections", () => {
  describe("from the source node", () => {
    it("marks the connection as outgoing, with the target as neighbor", async () => {
      await insertSampleGraph();
      const [connection] = await listConnections(env.DB, "pine");
      expect(connection).toMatchObject({ direction: "outgoing", neighborId: "fungus" });
    });
  });

  describe("from the target node", () => {
    it("marks the connection as incoming, with the source as neighbor", async () => {
      await insertSampleGraph();
      const [connection] = await listConnections(env.DB, "fungus");
      expect(connection).toMatchObject({ direction: "incoming", neighborId: "pine" });
    });
  });

  it("parses quality flags into a list", async () => {
    await insertSampleGraph();
    const [connection] = await listConnections(env.DB, "pine");
    expect(connection?.qualityFlags).toEqual(["unmatched_name"]);
  });
});
