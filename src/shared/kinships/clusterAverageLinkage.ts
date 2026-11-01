/** A tree of groups, each joined at the average distance between its members; a leaf is one organism. */
export type ClusterTree =
  | { id: string; height: 0; children: [] }
  | { id: null; height: number; children: [ClusterTree, ClusterTree] };

/**
 * Builds a tree by joining, again and again, the two groups whose members are closest on average
 * (the method biologists call UPGMA). Ties go to the pair found first.
 */
export function clusterAverageLinkage(ids: string[], distances: number[][]): ClusterTree {
  let groups = ids.map((id, index) => ({
    tree: { id, height: 0, children: [] } as ClusterTree,
    members: [index],
  }));
  while (groups.length > 1) {
    const [a, b, distance] = findClosestPair(groups, distances);
    const joined = {
      tree: {
        id: null,
        height: distance,
        children: [groups[a]?.tree, groups[b]?.tree],
      } as ClusterTree,
      members: [...(groups[a]?.members ?? []), ...(groups[b]?.members ?? [])],
    };
    groups = [...groups.filter((_, index) => index !== a && index !== b), joined];
  }
  const [root] = groups;
  if (!root) throw new Error("Cannot cluster an empty list of organisms.");
  return root.tree;
}

/** Lists the organisms at the leaves of a tree, from its first branch to its last. */
export function listLeaves(tree: ClusterTree): string[] {
  return tree.id !== null ? [tree.id] : tree.children.flatMap(listLeaves);
}

function findClosestPair(groups: { members: number[] }[], distances: number[][]) {
  let best: [number, number, number] = [0, 1, Infinity];
  for (let a = 0; a < groups.length; a += 1) {
    for (let b = a + 1; b < groups.length; b += 1) {
      const distance = averageDistance(
        groups[a]?.members ?? [],
        groups[b]?.members ?? [],
        distances,
      );
      if (distance < best[2]) best = [a, b, distance];
    }
  }
  return best;
}

function averageDistance(a: number[], b: number[], distances: number[][]) {
  let sum = 0;
  for (const i of a) for (const j of b) sum += distances[i]?.[j] ?? 1;
  return sum / (a.length * b.length);
}
