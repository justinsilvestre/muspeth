import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { type ConnectionFilter, emptyConnectionFilter } from "../shared/connectionFilter";
import { findNode, listConnections, listNodes } from "./graphQueries";
import { insertConnections } from "./test/insertConnections";
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

  it("includes where, when and at what taxonomic level the connection was recorded", async () => {
    await insertSampleGraph();
    await env.DB.prepare(
      `INSERT INTO connections (id, source_node_id, target_node_id, kind, relation, basis, taxonomic_level, weight, place, latitude, longitude, date, source, licence)
       VALUES (2, 'fungus', 'pine', 'interaction', 'eats', 'observed', 'genus', 0.5, 'Kyoto', 35.03, 135.78, '1990/1992', 'test', 'CC0-1.0')`,
    ).run();
    const [, connection] = await listConnections(env.DB, "pine");
    expect(connection).toMatchObject({
      taxonomicLevel: "genus",
      weight: 0.5,
      place: "Kyoto",
      latitude: 35.03,
      longitude: 135.78,
      date: "1990/1992",
    });
  });

  it("includes each connection's studies", async () => {
    await insertSampleGraph();
    const [connection] = await listConnections(env.DB, "pine");
    expect(connection?.sources).toEqual([
      {
        datasetId: "test/dataset",
        datasetCitation: "A dataset.",
        studyCitation: "A study.",
        studyUrl: "https://doi.org/10.1000/study",
        recordCount: 2,
      },
    ]);
  });

  it("gives an empty list of studies to a connection without any", async () => {
    await insertSampleGraph();
    await env.DB.prepare(
      `INSERT INTO connections (id, source_node_id, target_node_id, kind, relation, basis, source, licence)
       VALUES (2, 'fungus', 'pine', 'interaction', 'eats', 'observed', 'test', 'CC0-1.0')`,
    ).run();
    const [, connection] = await listConnections(env.DB, "pine");
    expect(connection?.sources).toEqual([]);
  });

  describe("with a filter", () => {
    async function listIdsFiltered(fields: Partial<ConnectionFilter>) {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", qualityFlags: ["unmatched_name"] },
        { id: 2, sourceNodeId: "c", targetNodeId: "a", kind: "likeness", basis: "computed" },
        { id: 3, sourceNodeId: "a", targetNodeId: "d", source: "mangal" },
        { id: 4, sourceNodeId: "a", targetNodeId: "e", qualityFlags: ["suspected_error"] },
      ]);
      const connections = await listConnections(env.DB, "a", {
        ...emptyConnectionFilter,
        ...fields,
      });
      return connections.map(({ id }) => id);
    }

    it("keeps only connections of the given kinds", async () => {
      expect(await listIdsFiltered({ kinds: ["likeness"] })).toEqual([2]);
    });

    it("keeps only connections on the given bases", async () => {
      expect(await listIdsFiltered({ bases: ["observed"] })).toEqual([1, 3, 4]);
    });

    it("keeps only connections from the given sources", async () => {
      expect(await listIdsFiltered({ sources: ["mangal"] })).toEqual([3]);
    });

    it("keeps only connections that carry one of the given flags", async () => {
      const flaggedWith = ["unmatched_name", "suspected_error"] as const;
      expect(await listIdsFiltered({ flaggedWith: [...flaggedWith] })).toEqual([1, 4]);
    });

    it("leaves out connections that carry any of the given flags", async () => {
      expect(await listIdsFiltered({ notFlaggedWith: ["suspected_error"] })).toEqual([1, 2, 3]);
    });

    it("combines its conditions", async () => {
      expect(
        await listIdsFiltered({ bases: ["observed"], notFlaggedWith: ["unmatched_name"] }),
      ).toEqual([3, 4]);
    });
  });
});
