import type { TaxonTreeNode } from "./buildTaxonTree";
import { countLeaves } from "./countLeaves";

export type Position = [x: number, y: number, z: number];

/** A run of the tree with no forks along it, drawn as one smooth curve. */
export type BranchPath = {
  /** The node where the path ends: a fork or a leaf. */
  endId: string;
  /** The nodes the path passes through after leaving its starting fork. */
  nodeIds: string[];
  /** The positions the curve passes through, from its starting fork, or the trunk's base, to its end. */
  positions: Position[];
  /**
   * For a path that rises from the trunk's base, the horizontal direction, as [x, z], in which its strand sits within the trunk.
   * It is null for other paths, and for a strand that forms the whole trunk alone.
   */
  trunkDirection: [x: number, z: number] | null;
  /** The position just before the starting fork, which sets the direction the curve leaves in. */
  leadPosition: Position | null;
  leafCount: number;
};

/**
 * Splits the tree into paths that each run from a fork to the next fork or leaf.
 * The root's paths each start at the trunk's base, so that together they form the trunk below the root.
 */
export function traceBranchPaths(
  root: TaxonTreeNode,
  positionsById: Map<string, Position>,
  trunkBase: Position,
) {
  const positionOf = (node: TaxonTreeNode) => positionsById.get(node.id) ?? trunkBase;
  const paths: BranchPath[] = [];
  const isTrunkShared = root.children.length > 1;

  const trace = (fork: TaxonTreeNode, leadPosition: Position, firstNode: TaxonTreeNode) => {
    const nodes = [firstNode];
    for (let last = firstNode; last.children.length === 1; ) {
      last = last.children[0] as TaxonTreeNode;
      nodes.push(last);
    }
    const end = nodes.at(-1) as TaxonTreeNode;
    const isStrand = fork === root;
    const positions = [...(isStrand ? [trunkBase] : []), ...[fork, ...nodes].map(positionOf)];
    const trunkDirection = isStrand && isTrunkShared ? findDirection(positionOf(firstNode)) : null;
    const nodeIds = nodes.map((node) => node.id);
    paths.push({
      endId: end.id,
      nodeIds,
      positions,
      leadPosition,
      trunkDirection,
      leafCount: countLeaves(end),
    });
    const endLeadPosition = positions.at(-2) as Position;
    for (const child of end.children) trace(end, endLeadPosition, child);
  };
  const [baseX, baseY, baseZ] = trunkBase;
  for (const child of root.children) trace(root, [baseX, baseY - 1, baseZ], child);

  return paths;
}

function findDirection([x, , z]: Position): [x: number, z: number] | null {
  const length = Math.hypot(x, z);
  return length === 0 ? null : [x / length, z / length];
}
