import { describe, expect, it } from "vitest";
import { type ClusterTree, clusterAverageLinkage, listLeaves } from "./clusterAverageLinkage";

const ids = ["red pine", "black pine", "matsutake", "shiitake"];
const distances = [
  [0, 0.1, 0.9, 1],
  [0.1, 0, 0.9, 1],
  [0.9, 0.9, 0, 0.2],
  [1, 1, 0.2, 0],
];

function listPairs(tree: ClusterTree): string[][] {
  if (tree.children.length === 0) return [];
  const [left, right] = tree.children;
  return [
    [...listLeaves(left), ...listLeaves(right)].sort(),
    ...listPairs(left),
    ...listPairs(right),
  ];
}

describe("clusterAverageLinkage", () => {
  it("joins the closest organisms first", () => {
    const tree = clusterAverageLinkage(ids, distances);
    expect(listPairs(tree)).toContainEqual(["black pine", "red pine"]);
  });

  it("joins groups at the average distance between their members", () => {
    const tree = clusterAverageLinkage(ids, distances);
    expect(tree.height).toBeCloseTo((0.9 + 1 + 0.9 + 1) / 4);
  });

  it("keeps every organism as a leaf", () => {
    const tree = clusterAverageLinkage(ids, distances);
    expect(listLeaves(tree).sort()).toEqual([...ids].sort());
  });

  it("makes a lone organism a leaf", () => {
    expect(clusterAverageLinkage(["moss"], [[0]])).toEqual({ id: "moss", height: 0, children: [] });
  });
});
