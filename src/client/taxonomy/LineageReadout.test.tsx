import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { LineageReadout } from "./LineageReadout";

function renderLineage(organismLabel: string, isNamedByTaxon: boolean) {
  const lineage = [
    { id: "densiflora", label: "Pinus densiflora", rank: "species", children: [] },
    { id: "pine", label: organismLabel, rank: "organism", children: [], isNamedByTaxon },
  ] satisfies TaxonTreeNode[];
  render(<LineageReadout lineage={lineage} />);
  return screen.getAllByRole("listitem").map((item) => item.textContent);
}

afterEach(cleanup);

describe("LineageReadout", () => {
  it("lists the taxon and the organism when their names differ", () => {
    expect(renderLineage("Japanese red pine", false)).toEqual([
      "speciesPinus densiflora",
      "Japanese red pine",
    ]);
  });

  it("lists an organism named by its taxon once, under the taxon's rank", () => {
    expect(renderLineage("Pinus densiflora", true)).toEqual(["speciesPinus densiflora"]);
  });
});
