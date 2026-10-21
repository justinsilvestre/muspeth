import type { RankedPath } from "../../shared/findPaths";

/** How many neighbours a node needs to count as a hub when explaining a path's rank. */
export const hubNeighborCount = 20;

/**
 * Explains in words why a path ranks where it does, for example "crosses 2 kinds of connection" and "avoids hubs".
 * A direct connection passes through no other node, so it gets no reason about hubs.
 */
export function listRankingReasons({
  kinds,
  neighborCounts,
}: Pick<RankedPath, "kinds" | "neighborCounts">) {
  const kindCount = `crosses ${kinds.length} ${kinds.length === 1 ? "kind" : "kinds"} of connection`;
  const nodesOnTheWay = neighborCounts.slice(1, -1);
  return nodesOnTheWay.length === 0 ? [kindCount] : [kindCount, describeHubs(nodesOnTheWay)];
}

function describeHubs(neighborCounts: number[]) {
  const hubs = neighborCounts.filter((count) => count >= hubNeighborCount);
  const busiest = Math.max(...hubs);
  if (hubs.length === 0) return "avoids hubs";
  if (hubs.length === 1) return `passes through a hub with ${busiest} neighbours`;
  return `passes through ${hubs.length} hubs, the busiest with ${busiest} neighbours`;
}
