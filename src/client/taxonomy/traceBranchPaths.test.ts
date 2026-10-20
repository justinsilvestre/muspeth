import { describe, expect, it } from "vitest";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { type Position, traceBranchPaths } from "./traceBranchPaths";

function makeNode(id: string, children: TaxonTreeNode[] = []) {
  return { id, label: id, rank: "test", children } satisfies TaxonTreeNode;
}

// root ─┬─ a ── b ─┬─ c
//       │          └─ d
//       └─ e
const tree = makeNode("root", [
  makeNode("a", [makeNode("b", [makeNode("c"), makeNode("d")])]),
  makeNode("e"),
]);

const positionsById = new Map<string, Position>(
  ["root", "a", "b", "c", "d", "e"].map((id, index) => [id, [index, index, index]]),
);

const trunkBase = [0, -2, 0] satisfies Position;

function findPath(endId: string) {
  return traceBranchPaths(tree, positionsById, trunkBase).find((path) => path.endId === endId);
}

describe("traceBranchPaths", () => {
  it("runs a trunk from its base up to the root", () => {
    expect(findPath("root")?.positions).toEqual([trunkBase, [0, 0, 0]]);
  });

  it("merges a run without forks into one path, starting at the fork it leaves", () => {
    expect(findPath("b")?.positions).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [2, 2, 2],
    ]);
  });

  it("lists the nodes a path passes through", () => {
    expect(findPath("b")?.nodeIds).toEqual(["a", "b"]);
  });

  it("leads into each path from the point before its fork, so it continues the parent's direction", () => {
    expect(findPath("c")?.leadPosition).toEqual([1, 1, 1]);
  });

  it("leads into the root's paths from the trunk base", () => {
    expect(findPath("e")?.leadPosition).toEqual(trunkBase);
  });

  it("counts the leaves each path carries", () => {
    expect(findPath("b")?.leafCount).toBe(2);
  });

  it("traces one path per fork-to-fork or fork-to-leaf run, plus the trunk", () => {
    expect(traceBranchPaths(tree, positionsById, trunkBase)).toHaveLength(5);
  });
});
