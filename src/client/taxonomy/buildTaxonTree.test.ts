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
      { id: "pine", label: "Japanese red pine", rank: "organism", children: [] },
    ]);
  });
});
