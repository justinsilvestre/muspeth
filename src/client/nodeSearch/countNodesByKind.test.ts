import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { countNodesByKind } from "./countNodesByKind";

function createNode(id: string, kind: GraphNode["kind"]) {
  return { id, kind, label: id, names: [] } satisfies GraphNode;
}

describe("countNodesByKind", () => {
  it("counts the nodes of each kind", () => {
    const nodes = [createNode("a", "word"), createNode("b", "word"), createNode("c", "place")];
    expect(countNodesByKind(nodes)).toMatchObject({ word: 2, place: 1 });
  });

  it("counts zero for a kind with no nodes", () => {
    expect(countNodesByKind([]).organism).toBe(0);
  });
});
