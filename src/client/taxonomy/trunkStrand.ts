import { type BranchShape, branchRadiusAt, heightAlongTree } from "./branchRadiusAt";
import type { BranchPath, Position } from "./traceBranchPaths";

/**
 * Moves the part of a strand that lies on the trunk's axis out toward the side its branch leaves for.
 * Each strand is as thick as a branch one rank above the root, and sits far enough out that the strands together span the trunk.
 */
export function offsetStrand(path: BranchPath, shape: BranchShape) {
  if (!path.trunkDirection) return path;
  const [dx, dz] = path.trunkDirection.map((component) => component * measureStrandOffset(shape));
  const shift = ([x, y, z]: Position) =>
    (isOnAxisBelowRoot([x, y, z])
      ? [x + (dx ?? 0), y, z + (dz ?? 0)]
      : [x, y, z]) satisfies Position;
  return {
    ...path,
    positions: path.positions.map(shift),
    leadPosition: path.leadPosition && shift(path.leadPosition),
  } satisfies BranchPath;
}

/**
 * Returns a strand's radius at a point on its centerline.
 * Within the trunk, the strand is as thick as a branch one rank above the root.
 * Above the root, it blends into the ordinary radius by its end, so it meets the branches that fork from it.
 */
export function strandRadiusAt(
  [x, y, z]: Position,
  [dx, dz]: [x: number, z: number],
  endHeight: number,
  shape: BranchShape,
) {
  const inTrunk = y <= 0 || endHeight <= 0 ? 1 : Math.max(0, 1 - y / endHeight);
  const offset = measureStrandOffset(shape) * inTrunk;
  const height = y <= 0 ? y : heightAlongTree([x - dx * offset, y, z - dz * offset]);
  return branchRadiusAt(height, shape) * (1 - inTrunk * (1 - shape.taperPerRank));
}

/** Measures how far each strand's center sits from the trunk's axis. */
function measureStrandOffset({ trunkRadius, taperPerRank }: BranchShape) {
  return trunkRadius * (1 - taperPerRank);
}

function isOnAxisBelowRoot([x, y, z]: Position) {
  return y <= 0 && Math.hypot(x, z) < 1e-6;
}
