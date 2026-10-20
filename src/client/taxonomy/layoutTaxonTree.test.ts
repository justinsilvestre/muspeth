import { describe, expect, it } from "vitest";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { layoutTaxonTree } from "./layoutTaxonTree";

function makeNode(id: string, children: TaxonTreeNode[] = []) {
  return { id, label: id, rank: "test", children } satisfies TaxonTreeNode;
}

const tree = makeNode("root", [makeNode("a", [makeNode("a1"), makeNode("a2")]), makeNode("b")]);

function findPoint(id: string) {
  return layoutTaxonTree(tree).points.find((point) => point.node.id === id);
}

describe("layoutTaxonTree", () => {
  it("places the root at the origin", () => {
    expect(Math.hypot(...(findPoint("root")?.position ?? [1]))).toBe(0);
  });

  it("raises each node one level above its parent", () => {
    const [, parentHeight] = findPoint("a")?.position ?? [];
    const [, childHeight] = findPoint("a1")?.position ?? [];
    expect(childHeight).toBeGreaterThan(parentHeight ?? Infinity);
  });

  it("spreads sibling leaves apart", () => {
    expect(findPoint("a1")?.position).not.toEqual(findPoint("a2")?.position);
  });

  it("records each node's parent", () => {
    expect(findPoint("a1")?.parentId).toBe("a");
  });

  it("stands the tree on a trunk below the root", () => {
    const [trunk] = layoutTaxonTree(tree).paths;
    expect(trunk?.positions[0]?.[1]).toBeLessThan(0);
  });
});
