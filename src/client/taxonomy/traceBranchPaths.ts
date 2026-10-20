import type { TaxonTreeNode } from "./buildTaxonTree";
import { countLeaves } from "./countLeaves";

export type Position = [x: number, y: number, z: number];

/** A run of the tree with no forks along it, drawn as one smooth curve. */
export type BranchPath = {
  /** The node where the path ends: a fork, a leaf, or the root for the trunk. */
  endId: string;
  /** The nodes the path passes through after leaving its starting fork. */
  nodeIds: string[];
  /** The positions the curve passes through, from its starting fork to its end. */
  positions: Position[];
  /** The position just before the starting fork, which sets the direction the curve leaves in. */
  leadPosition: Position | null;
  leafCount: number;
};

/** Splits the tree into paths that each run from a fork to the next fork or leaf, plus a trunk below the root. */
export function traceBranchPaths(
  root: TaxonTreeNode,
  positionsById: Map<string, Position>,
  trunkBase: Position,
) {
  const positionOf = (node: TaxonTreeNode) => positionsById.get(node.id) ?? trunkBase;
  const paths: BranchPath[] = [
    {
      endId: root.id,
      nodeIds: [root.id],
      positions: [trunkBase, positionOf(root)],
      leadPosition: null,
      leafCount: countLeaves(root),
    },
  ];

  const trace = (fork: TaxonTreeNode, leadPosition: Position, firstNode: TaxonTreeNode) => {
    const nodes = [firstNode];
    for (let last = firstNode; last.children.length === 1; ) {
      last = last.children[0] as TaxonTreeNode;
      nodes.push(last);
    }
    const end = nodes.at(-1) as TaxonTreeNode;
    const positions = [fork, ...nodes].map(positionOf);
    const nodeIds = nodes.map((node) => node.id);
    paths.push({ endId: end.id, nodeIds, positions, leadPosition, leafCount: countLeaves(end) });
    const endLeadPosition = positions.at(-2) as Position;
    for (const child of end.children) trace(end, endLeadPosition, child);
  };
  for (const child of root.children) trace(root, trunkBase, child);

  return paths;
}
