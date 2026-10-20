import { describe, expect, it } from "vitest";
import type { GraphNode } from "../shared/graph";
import { nodeDisplayName } from "./nodeDisplayName";

function createPine(names: GraphNode["names"]) {
  return { id: "pine", kind: "organism", label: "Pinus densiflora", names } satisfies GraphNode;
}

describe("nodeDisplayName", () => {
  it("returns the name in the given language", () => {
    const pine = createPine([{ language: "ja", name: "アカマツ" }]);
    expect(nodeDisplayName(pine, "ja")).toBe("アカマツ");
  });

  it("falls back to the label when there is no name in the given language", () => {
    const pine = createPine([{ language: "ja", name: "アカマツ" }]);
    expect(nodeDisplayName(pine, "en")).toBe("Pinus densiflora");
  });
});
