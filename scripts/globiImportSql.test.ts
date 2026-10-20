import { describe, expect, it } from "vitest";
import { toGlobiImportSql } from "./globiImportSql.ts";

const node = {
  id: "wikidata:Q1",
  label: "Pinus o'densiflora",
  names: [{ language: "ja", name: "アカマツ" }],
};
const connection = {
  sourceNodeId: "wikidata:Q2",
  targetNodeId: "wikidata:Q1",
  relation: "pathogenOf",
  taxonomicLevel: "species",
  citations: ["One.", "Two."],
  qualityFlags: ["unmatched_name"],
};

describe("toGlobiImportSql", () => {
  it("first removes connections from any earlier GloBI import", () => {
    expect(toGlobiImportSql([], [])).toMatch(/^DELETE FROM connections WHERE source = 'globi';/);
  });

  it("removes nodes from an earlier GloBI import that this one no longer adds", () => {
    expect(toGlobiImportSql([node], [], ["wikidata:Q1", "wikidata:Q20686564"])).toContain(
      "DELETE FROM nodes WHERE id IN ('wikidata:Q20686564');",
    );
  });

  it("removes no nodes when every earlier one is added again", () => {
    expect(toGlobiImportSql([node], [], ["wikidata:Q1"])).not.toContain("DELETE FROM nodes");
  });

  it("leaves existing nodes as they are", () => {
    expect(toGlobiImportSql([node], [])).toContain("ON CONFLICT (id) DO NOTHING");
  });

  it("escapes quotes in labels", () => {
    expect(toGlobiImportSql([node], [])).toContain("'Pinus o''densiflora'");
  });

  it("writes each node once", () => {
    expect(toGlobiImportSql([node, node], []).match(/INSERT INTO nodes/g)).toHaveLength(1);
  });

  it("adds names without duplicating ones already stored", () => {
    expect(toGlobiImportSql([node], [])).toContain(
      "INSERT OR IGNORE INTO node_names (node_id, language, name) VALUES ('wikidata:Q1', 'ja', 'アカマツ');",
    );
  });

  it("records the interaction as observed by GloBI, under its CC0 licence", () => {
    expect(toGlobiImportSql([], [connection])).toContain(
      "'interaction', 'pathogenOf', 'observed', 'species', 'globi', 'One.\nTwo.', 'CC0-1.0', '[\"unmatched_name\"]'",
    );
  });
});
