import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { createNodeCatalog } from "./createNodeCatalog";

const matsutake = {
  id: "wikidata:Q509308",
  kind: "organism",
  label: "Tricholoma matsutake",
  names: [],
} satisfies GraphNode;

const beetle = {
  id: "wikidata:Q15859794",
  kind: "organism",
  label: "Monochamus alternatus",
  names: [],
} satisfies GraphNode;

describe("createNodeCatalog", () => {
  it("offers the seed organisms that are present as starting points, in a fixed order", () => {
    const { startingPoints } = createNodeCatalog([beetle, matsutake]);
    expect(startingPoints.map(({ id }) => id)).toEqual(["wikidata:Q509308", "wikidata:Q15859794"]);
  });

  it("finds a node by its ID", () => {
    expect(createNodeCatalog([beetle]).nodesById.get(beetle.id)).toBe(beetle);
  });
});
