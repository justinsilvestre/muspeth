import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { TaxonTreeOutline } from "./TaxonTreeOutline";

function renderTreeWithMite(isPlacementUncertain: boolean) {
  const mite = { id: "mite", label: "mites", rank: "organism", children: [], isPlacementUncertain };
  const tree = {
    id: "life",
    label: "Life",
    rank: "root",
    children: [mite],
  } satisfies TaxonTreeNode;
  render(<TaxonTreeOutline tree={tree} />);
}

afterEach(cleanup);

describe("TaxonTreeOutline", () => {
  it("notes an uncertain placement", () => {
    renderTreeWithMite(true);
    expect(screen.getByText("mites (placement uncertain)")).toBeDefined();
  });

  it("names a certain placement plainly", () => {
    renderTreeWithMite(false);
    expect(screen.getByText("mites")).toBeDefined();
  });

  it("leaves out an organism named by the taxon it is placed on", () => {
    const pine = { id: "pine", label: "Pinus densiflora", rank: "organism", children: [] };
    const species = {
      id: "densiflora",
      label: "Pinus densiflora",
      rank: "species",
      children: [{ ...pine, isNamedByTaxon: true }],
    };
    render(
      <TaxonTreeOutline tree={{ id: "life", label: "Life", rank: "root", children: [species] }} />,
    );
    expect(screen.queryByText("Pinus densiflora")).toBeNull();
  });
});
