import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { createNodeCatalog } from "./createNodeCatalog";
import { findShownMatches, maxShownMatches } from "./findShownMatches";

const matsutake = {
  id: "wikidata:Q509308",
  kind: "organism",
  label: "Tricholoma matsutake",
  names: [],
} satisfies GraphNode;

const compounds = Array.from(
  { length: maxShownMatches + 1 },
  (_, index) =>
    ({
      id: `c${index}`,
      kind: "compound",
      label: `compound ${index}`,
      names: [],
    }) satisfies GraphNode,
);

const catalog = createNodeCatalog([matsutake, ...compounds]);

describe("findShownMatches", () => {
  describe("with an empty query and no kind", () => {
    it("offers the starting points", () => {
      expect(findShownMatches(catalog, "").matches.map(({ node }) => node)).toEqual([matsutake]);
    });

    it("leaves the total unknown", () => {
      expect(findShownMatches(catalog, "").totalCount).toBeUndefined();
    });
  });

  describe("with a query", () => {
    it("shows a limited number of matches", () => {
      expect(findShownMatches(catalog, "compound").matches).toHaveLength(maxShownMatches);
    });

    it("counts every match", () => {
      expect(findShownMatches(catalog, "compound").totalCount).toBe(maxShownMatches + 1);
    });
  });

  describe("with a kind but no query", () => {
    it("lists the nodes of that kind", () => {
      expect(findShownMatches(catalog, "", "organism").totalCount).toBe(1);
    });
  });
});
