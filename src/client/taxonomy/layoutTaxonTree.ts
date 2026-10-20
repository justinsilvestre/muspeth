import type { TaxonTreeNode } from "./buildTaxonTree";
import { countLeaves } from "./countLeaves";
import { type Position, traceBranchPaths } from "./traceBranchPaths";

type TreePoint = {
  node: TaxonTreeNode;
  parentId: string | null;
  position: Position;
  depth: number;
};

const levelHeight = 1;
const crownSpread = 1.5;
const trunkBase = [0, -2, 0] satisfies Position;

/**
 * Positions the tree in 3D as a crown that rises and widens from the root, which sits on a trunk.
 * Each leaf points in its own direction around the vertical axis, and each inner node points between its first and last leaves.
 */
export function layoutTaxonTree(root: TaxonTreeNode) {
  const anglesById = assignAngles(root);
  const maxDepth = Math.max(measureDepth(root), 1);
  const points: TreePoint[] = [];

  const place = (node: TaxonTreeNode, depth: number, parent?: TreePoint) => {
    const position = toPosition(anglesById.get(node.id) ?? 0, depth / maxDepth, maxDepth);
    const point = { node, parentId: parent?.node.id ?? null, position, depth };
    points.push(point);
    for (const child of node.children) place(child, depth + 1, point);
  };
  place(root, 0);

  const positionsById = new Map(points.map((point) => [point.node.id, point.position]));
  return { points, paths: traceBranchPaths(root, positionsById, trunkBase) };
}

/** Spaces the leaves evenly around a circle, and gives each inner node the midpoint of its leaves' range. */
function assignAngles(root: TaxonTreeNode) {
  const anglesById = new Map<string, number>();
  const leafCount = countLeaves(root);
  let leafIndex = 0;

  const assign = (node: TaxonTreeNode): [first: number, last: number] => {
    if (node.children.length === 0) {
      const angle = (2 * Math.PI * leafIndex++) / leafCount;
      anglesById.set(node.id, angle);
      return [angle, angle];
    }
    const ranges = node.children.map(assign);
    const first = ranges[0]?.[0] ?? 0;
    const last = ranges.at(-1)?.[1] ?? 0;
    anglesById.set(node.id, (first + last) / 2);
    return [first, last];
  };
  assign(root);

  return anglesById;
}

function measureDepth(node: TaxonTreeNode): number {
  return Math.max(0, ...node.children.map((child) => measureDepth(child) + 1));
}

/** Places a node by its angle and its height as a fraction of the tree's. */
function toPosition(angle: number, heightFraction: number, maxDepth: number) {
  // The crown widens steadily from the trunk, then levels off near the top like a parabola.
  const crownRadius = crownSpread * Math.sqrt(maxDepth);
  const radius = crownRadius * (1 - (1 - heightFraction) ** 2);
  return [
    radius * Math.cos(angle),
    heightFraction * maxDepth * levelHeight,
    radius * Math.sin(angle),
  ] satisfies Position;
}
