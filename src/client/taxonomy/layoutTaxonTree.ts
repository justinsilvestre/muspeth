import type { TaxonTreeNode } from "./buildTaxonTree";

type Position = [x: number, y: number, z: number];
type TreePoint = {
  node: TaxonTreeNode;
  parentId: string | null;
  position: Position;
  depth: number;
};
type TreeBranch = { childId: string; from: Position; to: Position; depth: number };

const levelHeight = 1;
const levelSpread = 1.5;

/**
 * Positions the tree in 3D as a crown that rises and widens from the root.
 * Each leaf points in its own direction around the vertical axis, and each inner node points between its first and last leaves.
 */
export function layoutTaxonTree(root: TaxonTreeNode) {
  const anglesById = assignAngles(root);
  const points: TreePoint[] = [];
  const branches: TreeBranch[] = [];

  const place = (node: TaxonTreeNode, depth: number, parent?: TreePoint) => {
    const position = toPosition(anglesById.get(node.id) ?? 0, depth);
    const point = { node, parentId: parent?.node.id ?? null, position, depth };
    points.push(point);
    if (parent) branches.push({ childId: node.id, from: parent.position, to: position, depth });
    for (const child of node.children) place(child, depth + 1, point);
  };
  place(root, 0);

  return { points, branches };
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

function countLeaves(node: TaxonTreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((total, child) => total + countLeaves(child), 0);
}

function toPosition(angle: number, depth: number) {
  // Widening with the square root of depth keeps the lowest levels apart without flattening the crown.
  const radius = Math.sqrt(depth) * levelSpread;
  return [
    radius * Math.cos(angle),
    depth * levelHeight,
    radius * Math.sin(angle),
  ] satisfies Position;
}
