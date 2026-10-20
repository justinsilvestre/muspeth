import { describe, expect, it } from "vitest";
import type { GraphNode } from "../shared/graph";
import { findDistinctName, nodeDisplayName } from "./nodeDisplayName";

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

describe("findDistinctName", () => {
  it("returns the name in the given language", () => {
    const pine = createPine([{ language: "ja", name: "アカマツ" }]);
    expect(findDistinctName(pine, "ja")).toBe("アカマツ");
  });

  it("returns nothing when there is no name in the given language", () => {
    expect(findDistinctName(createPine([]), "ja")).toBeUndefined();
  });

  it("returns nothing when the name repeats the label", () => {
    const pine = createPine([{ language: "en", name: "Pinus densiflora" }]);
    expect(findDistinctName(pine, "en")).toBeUndefined();
  });
});
