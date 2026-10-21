import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { countMatchesByKind } from "./countMatchesByKind";
import { createNodeCatalog } from "./createNodeCatalog";

function createNode(id: string, kind: GraphNode["kind"]) {
  return { id, kind, label: id, names: [] } satisfies GraphNode;
}

const catalog = createNodeCatalog([
  createNode("pine", "organism"),
  createNode("pinene", "compound"),
  createNode("oak", "organism"),
]);

describe("countMatchesByKind", () => {
  it("counts every node of each kind when nothing is searched", () => {
    expect(countMatchesByKind(catalog, " ").organism).toBe(2);
  });

  it("counts the matching nodes of each kind", () => {
    expect(countMatchesByKind(catalog, "pine")).toMatchObject({ organism: 1, compound: 1 });
  });
});
