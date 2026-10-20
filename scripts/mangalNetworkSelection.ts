/** A candidate network, by the dataset it belongs to and how many links it has. */
export type NetworkSize = { id: number; datasetId: number | null; interactionCount: number };

/** Bounds on how much of Mangal one import takes. */
export type NetworkLimits = {
  /** The most networks in all. */
  networkCount: number;
  /** The most links in all. */
  interactionCount: number;
  /** The most networks from one dataset, so that no single study dominates. */
  networksPerDataset: number;
};

/**
 * Picks networks within the limits: the pinned ones first, then the smallest, since a small
 * network of one site and season can be shown whole and keeps its place and date precise.
 */
export function selectNetworks(
  candidates: NetworkSize[],
  pinnedIds: number[],
  limits: NetworkLimits,
) {
  const isPinned = ({ id }: NetworkSize) => pinnedIds.includes(id);
  const ordered = [
    ...candidates.filter(isPinned),
    ...candidates
      .filter((candidate) => !isPinned(candidate))
      .sort((a, b) => a.interactionCount - b.interactionCount || a.id - b.id),
  ];
  const selected: NetworkSize[] = [];
  for (const candidate of ordered) {
    if (isPinned(candidate) || fitsLimits(selected, candidate, limits)) selected.push(candidate);
  }
  return selected.map(({ id }) => id);
}

function fitsLimits(selected: NetworkSize[], candidate: NetworkSize, limits: NetworkLimits) {
  const interactionCount = selected.reduce(
    (sum, { interactionCount }) => sum + interactionCount,
    0,
  );
  const datasetCount = selected.filter(({ datasetId }) => datasetId === candidate.datasetId).length;
  return (
    selected.length < limits.networkCount &&
    interactionCount + candidate.interactionCount <= limits.interactionCount &&
    datasetCount < limits.networksPerDataset
  );
}
