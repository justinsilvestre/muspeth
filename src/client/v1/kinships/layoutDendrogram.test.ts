import { describe, expect, it } from "vitest";
import type { ClusterTree } from "../../../shared/kinships/clusterAverageLinkage";
import { layoutDendrogram } from "./layoutDendrogram";

const leaf = (id: string) => ({ id, height: 0, children: [] }) satisfies ClusterTree;
const tree = {
  id: null,
  height: 1,
  children: [{ id: null, height: 0.5, children: [leaf("a"), leaf("b")] }, leaf("c")],
} satisfies ClusterTree;

describe("layoutDendrogram", () => {
  it("places the leaves one row apart, from the top", () => {
    const { leafY } = layoutDendrogram(tree, { rowHeight: 10, width: 100, side: "left" });
    expect([...leafY]).toEqual([
      ["a", 5],
      ["b", 15],
      ["c", 25],
    ]);
  });

  it("draws a left tree's joins further left the more distant the groups", () => {
    const { segments } = layoutDendrogram(tree, { rowHeight: 10, width: 100, side: "left" });
    const joinXs = segments.filter(({ x1, x2 }) => x1 === x2).map(({ x1 }) => x1);
    expect(joinXs.sort((p, q) => p - q)).toEqual([0, 50]);
  });

  it("mirrors a right tree, with its leaves at the left edge", () => {
    const { segments } = layoutDendrogram(tree, { rowHeight: 10, width: 100, side: "right" });
    const joinXs = segments.filter(({ x1, x2 }) => x1 === x2).map(({ x1 }) => x1);
    expect(joinXs.sort((p, q) => p - q)).toEqual([50, 100]);
  });

  it("marks the joins of groups that share nothing", () => {
    const { segments } = layoutDendrogram(tree, { rowHeight: 10, width: 100, side: "left" });
    expect(segments.filter(({ isUnrelated }) => isUnrelated)).toHaveLength(3);
  });
});
