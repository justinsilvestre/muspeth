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

  describe("when irregular", () => {
    it("varies the heights of leaves at the same rank", () => {
      const { points } = layoutTaxonTree(tree, { irregularity: 1 });
      const [a1, a2] = ["a1", "a2"].map((id) => points.find((point) => point.node.id === id));
      expect(a1?.position[1]).not.toBe(a2?.position[1]);
    });

    it("lays out the same tree the same way every time", () => {
      expect(layoutTaxonTree(tree, { irregularity: 1 })).toEqual(
        layoutTaxonTree(tree, { irregularity: 1 }),
      );
    });
  });

  describe("leaf spread", () => {
    function horizontalDistance(spread: number, id: string) {
      const point = layoutTaxonTree(tree, { leafSpread: spread }).points.find(
        (candidate) => candidate.node.id === id,
      );
      const [x = 0, , z = 0] = point?.position ?? [];
      return Math.hypot(x, z);
    }

    it("keeps leaves at the same rank on the crown's rim without spread", () => {
      expect(horizontalDistance(0, "a1")).toBeCloseTo(horizontalDistance(0, "a2"));
    });

    it("moves leaves at the same rank to different distances from the axis with spread", () => {
      expect(horizontalDistance(1, "a1")).not.toBeCloseTo(horizontalDistance(1, "a2"));
    });
  });

  describe("splay", () => {
    function findSplayedPoint(splay: number, id: string) {
      return layoutTaxonTree(tree, { splay }).points.find((point) => point.node.id === id);
    }

    it("tips leaning nodes lower", () => {
      expect(findSplayedPoint(1, "a1")?.position[1]).toBeLessThan(
        findSplayedPoint(0, "a1")?.position[1] ?? 0,
      );
    });

    it("keeps each node's distance from the root", () => {
      const distance = (splay: number) =>
        Math.hypot(...(findSplayedPoint(splay, "a1")?.position ?? []));
      expect(distance(1)).toBeCloseTo(distance(0));
    });
  });
});
