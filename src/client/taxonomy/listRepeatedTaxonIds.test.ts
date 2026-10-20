import { describe, expect, it } from "vitest";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { listRepeatedTaxonIds } from "./listRepeatedTaxonIds";

function createLineage(isNamedByTaxon: boolean) {
  return [
    { id: "pinus", label: "Pinus", rank: "genus", children: [] },
    { id: "densiflora", label: "Pinus densiflora", rank: "species", children: [] },
    { id: "pine", label: "Pinus densiflora", rank: "organism", children: [], isNamedByTaxon },
  ] satisfies TaxonTreeNode[];
}

describe("listRepeatedTaxonIds", () => {
  it("lists the taxon whose name the organism beneath it repeats", () => {
    expect(listRepeatedTaxonIds(createLineage(true))).toEqual(new Set(["densiflora"]));
  });

  it("lists nothing when the organism has a name of its own", () => {
    expect(listRepeatedTaxonIds(createLineage(false)).size).toBe(0);
  });
});
