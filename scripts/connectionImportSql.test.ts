import { describe, expect, it } from "vitest";
import { toConnectionImportSql } from "./connectionImportSql.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";

const study = {
  datasetId: "globalbioticinteractions/eppo",
  datasetCitation: "EPPO.",
  studyCitation: "Mamiya 1983.",
  studyUrl: "https://doi.org/10.1146/annurev.py.21.090183.001221",
  recordCount: 3,
};

function makeNode(overrides: Partial<NodeDraft> = {}) {
  return {
    id: "wikidata:Q1",
    kind: "organism",
    label: "Pinus o'densiflora",
    names: [{ language: "ja", name: "アカマツ" }],
    ...overrides,
  } satisfies NodeDraft;
}

function makeConnection(overrides: Partial<ConnectionDraft> = {}) {
  return {
    sourceNodeId: "wikidata:Q2",
    targetNodeId: "wikidata:Q1",
    kind: "interaction",
    relation: "pathogenOf",
    basis: "observed",
    taxonomicLevel: "species",
    licence: "CC0-1.0",
    qualityFlags: ["unmatched_name"],
    sources: [study],
    ...overrides,
  } satisfies ConnectionDraft;
}

describe("toConnectionImportSql", () => {
  describe("on replacing the import's previous run", () => {
    it("removes the connections that the same import wrote", () => {
      expect(toConnectionImportSql("test", [], [])).toContain(
        "DELETE FROM connections WHERE source = 'test';",
      );
    });

    it("removes the sources of those connections before the connections", () => {
      expect(toConnectionImportSql("test", [], [])).toMatch(
        /^DELETE FROM connection_sources WHERE connection_id IN \(SELECT id FROM connections WHERE source = 'test'\);\nDELETE FROM connections/,
      );
    });

    it("removes the import's earlier nodes that this run no longer adds", () => {
      const sql = toConnectionImportSql("test", [makeNode()], [], ["wikidata:Q1", "wikidata:Q9"]);
      expect(sql).toContain("DELETE FROM nodes WHERE source = 'test' AND id IN ('wikidata:Q9');");
    });

    it("hands an earlier node that other imports still connect to one of those imports", () => {
      const sql = toConnectionImportSql("test", [], [], ["wikidata:Q9"]);
      expect(sql).toContain(
        "UPDATE nodes SET source = (SELECT connections.source FROM connections WHERE connections.source_node_id = nodes.id OR connections.target_node_id = nodes.id ORDER BY connections.id LIMIT 1)\n  WHERE source = 'test' AND id IN ('wikidata:Q9') AND EXISTS",
      );
    });

    it("removes the media that the same import linked", () => {
      expect(toConnectionImportSql("test", [], [])).toContain("WHERE media_source = 'test';");
    });

    it("removes no nodes when every earlier one is added again", () => {
      const sql = toConnectionImportSql("test", [makeNode()], [], ["wikidata:Q1"]);
      expect(sql).not.toContain("DELETE FROM nodes");
    });

    it("removes no earlier node that this run's connections link", () => {
      const sql = toConnectionImportSql("test", [], [makeConnection()], ["wikidata:Q1"]);
      expect(sql).not.toContain("DELETE FROM nodes");
    });

    it("splits long lists of earlier nodes across statements", () => {
      const previousIds = Array.from({ length: 5000 }, (_, index) => `test:${index}`);
      const sql = toConnectionImportSql("test", [], [], previousIds);
      expect(sql.match(/DELETE FROM nodes/g)).toHaveLength(2);
    });
  });

  describe("on adding nodes", () => {
    it("records the import as the node's source", () => {
      expect(toConnectionImportSql("test", [makeNode()], [])).toContain(
        "VALUES ('wikidata:Q1', 'organism', 'Pinus o''densiflora', 'test')",
      );
    });

    it("updates only the nodes that the same import added", () => {
      expect(toConnectionImportSql("test", [makeNode()], [])).toContain(
        "WHERE nodes.source = excluded.source;",
      );
    });

    it("leaves the media of a node drafted without media", () => {
      expect(toConnectionImportSql("test", [makeNode()], [])).toContain(
        "DO UPDATE SET label = excluded.label WHERE",
      );
    });

    it("links the node's media under the media's own licence and credit", () => {
      const node = makeNode({
        media: {
          url: "https://example.org/pine.jpg",
          licence: "CC-BY-4.0",
          credit: "A. Painter",
          pageUrl: "https://example.org/pine",
        },
      });
      expect(toConnectionImportSql("test", [node], [])).toContain(
        "'test', 'https://example.org/pine.jpg', 'CC-BY-4.0', 'A. Painter', 'https://example.org/pine', 'test')",
      );
    });

    it("writes each node once", () => {
      const sql = toConnectionImportSql("test", [makeNode(), makeNode()], []);
      expect(sql.match(/INSERT INTO nodes/g)).toHaveLength(1);
    });

    it("adds names without duplicating ones already stored", () => {
      expect(toConnectionImportSql("test", [makeNode()], [])).toContain(
        "INSERT OR IGNORE INTO node_names (node_id, language, name) VALUES ('wikidata:Q1', 'ja', 'アカマツ');",
      );
    });

    it("adds the names of every draft of the same node", () => {
      const other = makeNode({ names: [{ language: "en", name: "Japanese red pine" }] });
      const sql = toConnectionImportSql("test", [makeNode(), other], []);
      expect(sql.match(/INSERT OR IGNORE INTO node_names/g)).toHaveLength(2);
    });
  });

  describe("on adding connections", () => {
    it("records every column of the connection under the import's source", () => {
      expect(toConnectionImportSql("test", [], [makeConnection()])).toContain(
        "VALUES ('wikidata:Q2', 'wikidata:Q1', 'interaction', 'pathogenOf', 'observed', 'species', NULL, NULL, NULL, NULL, NULL, 'test', 'CC0-1.0', '[\"unmatched_name\"]');",
      );
    });

    it("records the weight, place, coordinates and date when given", () => {
      const connection = makeConnection({
        weight: 0.5,
        place: "Kyoto",
        latitude: 35.03,
        longitude: 135.78,
        date: "1990/1992",
      });
      expect(toConnectionImportSql("test", [], [connection])).toContain(
        "'species', 0.5, 'Kyoto', 35.03, 135.78, '1990/1992', 'test'",
      );
    });

    it("credits each study to the connection just inserted", () => {
      expect(toConnectionImportSql("test", [], [makeConnection()])).toContain(
        "SELECT (SELECT MAX(id) FROM connections), studies.* FROM (VALUES ('globalbioticinteractions/eppo', 'EPPO.', 'Mamiya 1983.', 'https://doi.org/10.1146/annurev.py.21.090183.001221', 3)) AS studies;",
      );
    });

    it("splits a long list of studies across statements", () => {
      const longStudy = { ...study, studyCitation: "A study.".repeat(2000) };
      const connection = makeConnection({ sources: [longStudy, longStudy] });
      const sql = toConnectionImportSql("test", [], [connection]);
      expect(sql.match(/INSERT INTO connection_sources/g)).toHaveLength(2);
    });

    it("writes no sources for a connection without any", () => {
      const sql = toConnectionImportSql("test", [], [makeConnection({ sources: [] })]);
      expect(sql).not.toContain("INSERT INTO connection_sources");
    });
  });
});
