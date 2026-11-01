import { describe, expect, it } from "vitest";
import { type ClusterTree, listLeaves } from "./clusterAverageLinkage";
import { rotateToMatch } from "./rotateToMatch";

const leaf = (id: string) => ({ id, height: 0, children: [] }) satisfies ClusterTree;
const join = (a: ClusterTree, b: ClusterTree) =>
  ({ id: null, height: 1, children: [a, b] }) satisfies ClusterTree;

describe("rotateToMatch", () => {
  it("swaps branches so the leaves follow the reference order where they can", () => {
    const tree = join(join(leaf("d"), leaf("c")), join(leaf("b"), leaf("a")));
    expect(listLeaves(rotateToMatch(tree, ["a", "b", "c", "d"]))).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps the groups the tree makes", () => {
    const tree = join(join(leaf("a"), leaf("c")), join(leaf("b"), leaf("d")));
    expect(listLeaves(rotateToMatch(tree, ["a", "b", "c", "d"]))).toEqual(["a", "c", "b", "d"]);
  });
});
