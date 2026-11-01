import { describe, expect, it } from "vitest";
import { selectFoodWebSubset } from "./foodWebSubset.ts";
import type { MangalNetworkContent } from "./mangalConnections.ts";
import type { MangalInteraction, MangalNode } from "./mangalRecords.ts";

function makeNode(id: number, originalName: string) {
  return { id, networkId: 5013, originalName, taxonomy: null } satisfies MangalNode;
}

function makeLink(nodeFrom: number, nodeTo: number, type: string) {
  return {
    nodeFrom,
    nodeTo,
    type,
    date: null,
    value: 1,
    attribute: null,
  } satisfies MangalInteraction;
}

/** Spider 1 eats three bugs, spider 2 eats one, bug 3 eats two plants, bug 4 eats one, and a slug eats fungi. */
const content = {
  network: { id: 5013, name: "", date: null, geometry: null, description: "", datasetId: null },
  dataset: null,
  reference: null,
  nodes: [
    makeNode(1, "spider 1"),
    makeNode(2, "spider 2"),
    makeNode(3, "bug 3"),
    makeNode(4, "bug 4"),
    makeNode(5, "bug 5"),
    makeNode(6, "plant 6"),
    makeNode(7, "plant 7"),
    makeNode(8, "slug 8"),
    makeNode(9, "fungi"),
  ],
  interactions: [
    makeLink(1, 3, "predation"),
    makeLink(1, 4, "predation"),
    makeLink(1, 5, "predation"),
    makeLink(2, 3, "predation"),
    makeLink(3, 6, "herbivory"),
    makeLink(3, 7, "herbivory"),
    makeLink(4, 6, "herbivory"),
    makeLink(8, 9, "detritivore"),
  ],
} satisfies MangalNetworkContent;

describe("selectFoodWebSubset", () => {
  it("keeps the most linked consumer and resource of each type", () => {
    const subset = selectFoodWebSubset(content, 1, []);
    expect(subset.nodes.map(({ id }) => id)).toEqual([1, 3, 6, 8, 9]);
  });

  it("keeps only the links among the kept nodes", () => {
    const subset = selectFoodWebSubset(content, 1, []);
    expect(subset.interactions).toEqual([
      makeLink(1, 3, "predation"),
      makeLink(3, 6, "herbivory"),
      makeLink(8, 9, "detritivore"),
    ]);
  });

  it("keeps pinned nodes whatever their links", () => {
    const subset = selectFoodWebSubset(content, 1, ["plant 7"]);
    expect(subset.nodes.map(({ id }) => id)).toContain(7);
  });

  it("breaks ties by the lower node identifier", () => {
    const tied = {
      ...content,
      interactions: [makeLink(2, 3, "predation"), makeLink(1, 4, "predation")],
    };
    expect(selectFoodWebSubset(tied, 1, []).nodes.map(({ id }) => id)).toEqual([1, 3]);
  });
});
