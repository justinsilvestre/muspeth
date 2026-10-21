import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { findNodesWithSharedNames } from "./findNodesWithSharedNames";

function bee(id: string, label: string, englishName: string) {
  return {
    id,
    kind: "organism",
    label,
    names: [{ language: "en", name: englishName }],
  } satisfies GraphNode;
}

describe("findNodesWithSharedNames", () => {
  it("returns the nodes whose display name another node also has", () => {
    const nodes = [
      bee("western", "Apis mellifera", "Honey Bee"),
      bee("eastern", "Apis cerana", "honey bee"),
      bee("bumble", "Bombus", "bumblebee"),
    ];
    expect([...findNodesWithSharedNames(nodes)]).toEqual(["western", "eastern"]);
  });
});
