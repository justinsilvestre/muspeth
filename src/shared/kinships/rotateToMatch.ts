import type { ClusterTree } from "./clusterAverageLinkage";

/**
 * Swaps the two branches of each group, where that helps, so that the leaves come as close as they can
 * to a reference order. Two trees drawn facing each other then need fewer crossing lines.
 */
export function rotateToMatch(tree: ClusterTree, referenceOrder: string[]): ClusterTree {
  const positions = new Map(referenceOrder.map((id, index) => [id, index]));
  return rotate(tree, positions);
}

function rotate(tree: ClusterTree, positions: Map<string, number>): ClusterTree {
  if (tree.id !== null) return tree;
  const [first, second] = tree.children.map((child) => rotate(child, positions)) as [
    ClusterTree,
    ClusterTree,
  ];
  const isSwapped = meanPosition(first, positions) > meanPosition(second, positions);
  return { ...tree, children: isSwapped ? [second, first] : [first, second] };
}

function meanPosition(tree: ClusterTree, positions: Map<string, number>): number {
  const leaves = collectLeaves(tree);
  return leaves.reduce((sum, id) => sum + (positions.get(id) ?? 0), 0) / leaves.length;
}

function collectLeaves(tree: ClusterTree): string[] {
  return tree.id !== null ? [tree.id] : tree.children.flatMap(collectLeaves);
}
