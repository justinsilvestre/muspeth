/** How the trunk and branches thin from the root upward. */
export type BranchShape = { trunkRadius: number; taperPerRank: number };

/** How much wider the trunk grows per unit of height below the root. */
const flarePerUnit = 0.08;

/**
 * Returns the branch radius at the given height, measured in ranks above the root.
 * Above the root, the tree thins by the same fraction with each rank, so branches meet seamlessly at forks.
 * Below it, the trunk widens only slightly toward its base.
 */
export function branchRadiusAt(height: number, { trunkRadius, taperPerRank }: BranchShape) {
  if (height < 0) return trunkRadius * (1 - height * flarePerUnit);
  return trunkRadius * taperPerRank ** height;
}

/**
 * Returns the fraction of its thickness a branch keeps at a point along it, from 0 at its start to 1 at its end.
 * The branch keeps its thickness until its last stretch, then narrows to a point.
 */
export function tipTaper(along: number, lastStretch: number) {
  return Math.min(1, (1 - along) / lastStretch);
}
