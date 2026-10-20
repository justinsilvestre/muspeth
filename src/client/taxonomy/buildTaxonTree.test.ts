import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import type { Taxon, TaxonPlacement } from "../../shared/taxonomy";
import { buildTaxonTree } from "./buildTaxonTree";

const taxa = [
  { id: "plantae", parentId: null, rank: "kingdom", name: "Plantae" },
  { id: "pinus", parentId: "plantae", rank: "genus", name: "Pinus" },
] satisfies Taxon[];

const placements = [
  { nodeId: "pine", taxonId: "pinus", qualityFlags: [] },
] satisfies TaxonPlacement[];

const nodes = [
  {
    id: "pine",
    kind: "organism",
    label: "Pinus densiflora",
    names: [{ language: "en", name: "Japanese red pine" }],
  },
] satisfies GraphNode[];

describe("buildTaxonTree", () => {
  it("roots every kingdom in a single tree of life", () => {
    const tree = buildTaxonTree(taxa, placements, nodes);
    expect(tree.children.map((child) => child.label)).toEqual(["Plantae"]);
  });

  it("nests each taxon under its parent", () => {
    const [plantae] = buildTaxonTree(taxa, placements, nodes).children;
    expect(plantae?.children.map((child) => child.label)).toEqual(["Pinus"]);
  });

  it("hangs each organism, by its English name, from the taxon it is placed on", () => {
    const [plantae] = buildTaxonTree(taxa, placements, nodes).children;
    const [pinus] = plantae?.children ?? [];
    expect(pinus?.children).toEqual([
      {
        id: "pine",
        label: "Japanese red pine",
        rank: "organism",
        children: [],
        isPlacementUncertain: false,
      },
    ]);
  });

  describe("when a placement is flagged", () => {
    const placeWithFlags = (qualityFlags: string[]) => {
      const placement = { nodeId: "pine", taxonId: "pinus", qualityFlags };
      const [plantae] = buildTaxonTree(taxa, [placement], nodes).children;
      return plantae?.children[0]?.children[0];
    };

    it("marks an organism placed on a higher rank than its own as uncertain", () => {
      expect(placeWithFlags(["higher_rank_match"])?.isPlacementUncertain).toBe(true);
    });

    it("marks an organism placed with an outside hint as uncertain", () => {
      expect(placeWithFlags(["globi_lineage_hint"])?.isPlacementUncertain).toBe(true);
    });

    it("marks an organism matched by a similar name as uncertain", () => {
      expect(placeWithFlags(["fuzzy_name_match"])?.isPlacementUncertain).toBe(true);
    });

    it("keeps an organism known by a synonym certain", () => {
      expect(placeWithFlags(["synonym_name"])?.isPlacementUncertain).toBe(false);
    });
  });
});
