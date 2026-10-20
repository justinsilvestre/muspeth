import type { TaxonTreeNode } from "./buildTaxonTree";
import { countLeaves } from "./countLeaves";
import { hashToUnit } from "./hashToUnit";
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

/** How the crown departs from a flat ring of leaves. */
export type CrownShape = {
  /** From 0 to 1, how far leaves move from the crown's rim to positions across its whole width. */
  leafSpread: number;
  /** How far branches rotate away from upright, as a fraction of how far they already lean; splayed crowns arch into a dome. */
  splay: number;
  /** From 0 to 1, how far each node is nudged by a fixed amount, giving the crown an uneven outline. */
  irregularity: number;
};

const flatCrown = { leafSpread: 0, splay: 0, irregularity: 0 } satisfies CrownShape;

/**
 * Positions the tree in 3D as a crown that rises and widens from the root, which sits on a trunk.
 * Each leaf points in its own direction around the vertical axis, and each inner node points between its first and last leaves.
 */
export function layoutTaxonTree(root: TaxonTreeNode, crown: Partial<CrownShape> = {}) {
  const { leafSpread, splay, irregularity } = { ...flatCrown, ...crown };
  const directionsById = assignDirections(root, leafSpread);
  const maxDepth = Math.max(measureDepth(root), 1);
  const points: TreePoint[] = [];

  const place = (node: TaxonTreeNode, depth: number, parent?: TreePoint) => {
    const direction = directionsById.get(node.id) ?? { angle: 0, reach: 1 };
    const regular = { ...direction, heightFraction: depth / maxDepth };
    const upright = toPosition(roughen(node.id, regular, irregularity), maxDepth);
    const position = splayFromRoot(upright, splay, maxDepth * levelHeight);
    const point = { node, parentId: parent?.node.id ?? null, position, depth };
    points.push(point);
    for (const child of node.children) place(child, depth + 1, point);
  };
  place(root, 0);

  const positionsById = new Map(points.map((point) => [point.node.id, point.position]));
  return { points, paths: traceBranchPaths(root, positionsById, trunkBase) };
}

/** The golden ratio's fractional part, whose multiples spread evenly over the range from 0 to 1. */
const goldenFraction = 0.6180339887;
/** The smallest reach a leaf can have, which keeps leaves off the trunk's axis. */
const minimumReach = 0.3;

/**
 * Gives each node a direction around the vertical axis and a reach: its distance from the axis as a fraction of the crown's width.
 * Leaves are spaced evenly around the circle, so each clade keeps its own wedge.
 * With spread, consecutive leaves take reaches from a golden-ratio sequence, which fills each wedge evenly by area.
 * Each inner node points between its first and last leaves, at the average reach of its leaves.
 */
function assignDirections(root: TaxonTreeNode, leafSpread: number) {
  const directionsById = new Map<string, { angle: number; reach: number }>();
  const leafCount = countLeaves(root);
  let leafIndex = 0;

  type Span = { first: number; last: number; reachTotal: number; leafCount: number };
  const assign = (node: TaxonTreeNode): Span => {
    if (node.children.length === 0) {
      const angle = (2 * Math.PI * leafIndex) / leafCount;
      const evenFraction = ((leafIndex + 0.5) * goldenFraction) % 1;
      const areaReach = Math.sqrt(minimumReach ** 2 + (1 - minimumReach ** 2) * evenFraction);
      const reach = 1 - leafSpread * (1 - areaReach);
      leafIndex++;
      directionsById.set(node.id, { angle, reach });
      return { first: angle, last: angle, reachTotal: reach, leafCount: 1 };
    }
    const spans = node.children.map(assign);
    const span = {
      first: spans[0]?.first ?? 0,
      last: spans.at(-1)?.last ?? 0,
      reachTotal: spans.reduce((total, child) => total + child.reachTotal, 0),
      leafCount: spans.reduce((total, child) => total + child.leafCount, 0),
    };
    const angle = (span.first + span.last) / 2;
    directionsById.set(node.id, { angle, reach: span.reachTotal / span.leafCount });
    return span;
  };
  assign(root);

  return directionsById;
}

function measureDepth(node: TaxonTreeNode): number {
  return Math.max(0, ...node.children.map((child) => measureDepth(child) + 1));
}

type Placement = { angle: number; reach: number; heightFraction: number; radiusScale?: number };

/** The farthest a node can lean from upright, which stops splayed branches from curling back under the crown. */
const maxLean = Math.PI * 0.6;

/**
 * Rotates a node about the root, away from upright, keeping its distance from the root.
 * Its lean from vertical grows by the splay fraction, scaled by its distance from the root relative to the tree's height,
 * so low branches barely turn while outer ones arch over, as if each branch bent a little more along its length.
 */
function splayFromRoot([x, y, z]: Position, splay: number, treeHeight: number) {
  const horizontal = Math.hypot(x, z);
  if (splay === 0 || horizontal === 0) return [x, y, z] satisfies Position;
  const distance = Math.hypot(horizontal, y);
  const bend = 1 + splay * Math.min(distance / treeHeight, 1);
  const lean = Math.min(Math.atan2(horizontal, y) * bend, maxLean);
  const scale = (distance * Math.sin(lean)) / horizontal;
  return [x * scale, distance * Math.cos(lean), z * scale] satisfies Position;
}

/**
 * Adds irregularity that grows toward the top of the tree, so the trunk stays upright while the crown loosens.
 * Smooth waves around the axis give the crown lobes; per-node offsets keep neighbours from lining up.
 */
function roughen(id: string, { angle, reach, heightFraction }: Placement, irregularity: number) {
  const weight = irregularity * heightFraction;
  const lobes = 0.12 * Math.sin(3 * angle + 0.7) + 0.07 * Math.sin(5 * angle + 2.1);
  return {
    angle: angle + weight * 0.1 * hashToUnit(id, "angle"),
    reach,
    heightFraction:
      heightFraction +
      weight * (0.05 * hashToUnit(id, "height") + 0.06 * Math.sin(4 * angle + 1.3)),
    radiusScale: 1 + weight * (lobes + 0.1 * hashToUnit(id, "radius")),
  } satisfies Placement;
}

/** Places a node by its angle and its height as a fraction of the tree's. */
function toPosition(placement: Placement, maxDepth: number) {
  const { angle, reach, heightFraction, radiusScale = 1 } = placement;
  // The crown widens steadily from the trunk, then levels off near the top like a parabola.
  const crownRadius = crownSpread * Math.sqrt(maxDepth);
  const radius = crownRadius * (1 - (1 - heightFraction) ** 2) * reach * radiusScale;
  return [
    radius * Math.cos(angle),
    heightFraction * maxDepth * levelHeight,
    radius * Math.sin(angle),
  ] satisfies Position;
}
